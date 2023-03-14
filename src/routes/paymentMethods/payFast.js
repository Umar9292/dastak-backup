const Router = require('express/lib/router');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone');

const router = Router();

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');
const WalletHistory = require('../../models/walletHistory');

const { getAddress } = require('../../geoCoder/getAddress');
const { getDistance } = require('../../geoCoder/getDistance');
const {
  notifyUser,
  notifyAdmin,
  notifySuperAdmin,
} = require('../../notificationHandler/handler');
const {
  emailOrderDetails,
  notifyRestaurantByEmail,
} = require('../../emailHandler/orderEmail/orderEmail');
const {
  emailOrderDetailsToCustomer,
} = require('../../emailHandler/customerEmail/customerEmail');

router.post('/v2/getToken', async (req, res) => {
  try {
    const {
      userId,
      paymentType,
      onlineAmount,
      orderTotal,
      products,
    } = req.body;

    const transactionId = `PF${moment()
      .tz('Asia/Karachi')
      .format('YYYYMMDD')}${crypto.randomBytes(2).toString('hex')}`;

    const date = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const body = {
      MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
      SECURED_KEY: process.env.PAYFAST_SECURED_KEY,
      BASKET_ID: transactionId,
      TXNAMT: paymentType === 'split' ? onlineAmount : orderTotal,
    };

    req.body.date = date;
    req.body.transactionId = transactionId;
    req.body.products = JSON.parse(products);

    const [{ data }] = await Promise.all([
      axios.post(process.env.PAYFAST_TOKEN_URL, body),

      Users.findByIdAndUpdate(userId, { $push: { onlineOrder: req.body } }),
    ]);

    res.json({ status: '200', token: data.ACCESS_TOKEN, transactionId });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

router.post('/payFastCallback', async (req, res) => {
  try {
    const { err_code, basket_id, issuer_name, PaymentName } = req.body;

    const transactionType = basket_id.substring(0, 4);

    if (transactionType === 'PFTO' && err_code === '000') {
      const user = await Users.findOne(
        {
          topUp: {
            $elemMatch: {
              transactionId: basket_id,
            },
          },
        },
        {
          'topUp.$': 1,
          playerId: 1,
          phone: 1,
          wallet: 1,
        }
      );

      const { actualAmount } = user.topUp[0];
      user.wallet.amount += +actualAmount;
      user.topUp[0].status = 'Successful';

      const topUp = {
        type: 'Top Up',
        amount: actualAmount,
        transactionId: basket_id,
        userId: user._id,
        topUpMethod: PaymentName,
        issuerName: issuer_name,
        time: moment()
          .tz('Asia/karachi')
          .format('MM-DD-YYYY hh:mm a'),
      };

      const msg = `Dear Dastak user, amount of Rs. ${actualAmount} has been added to your dastak wallet. Your new dastak wallet balance is Rs. ${user.wallet.amount}. Happy ordering!`;

      await Promise.all([
        new WalletHistory(topUp).save(),
        Users.findByIdAndUpdate(user._id, {
          wallet: user.wallet,
          topUp: user.topUp,
        }),
        notifyUser(msg, user.playerId, { flag: 'topUp' }),
        axios.get(
          `${process.env.OTP_URL}&to=${92 +
            user.phone.substring(1, 8)}&message=${msg}`
        ),
      ]);

      return res.status(200).send();
    }

    if (err_code === '000') {
      const orderIsThere = await Orders.findOne({ transactionId: basket_id })
        .select('transactionId')
        .lean();

      if (orderIsThere) {
        return res.status(200).send();
      }

      const { onlineOrder: order } = await Users.findOne(
        {
          onlineOrder: {
            $elemMatch: {
              transactionId: basket_id,
            },
          },
        },
        {
          'onlineOrder.$': 1,
        }
      );

      const {
        martId,
        latitude: userLatitude,
        longitude: userLongitude,
        products,
        orderTotal,
        paymentType,
        walletAmount,
      } = order[0];

      const date = moment()
        .tz('Asia/Karachi')
        .format('DD-MM-YYYY');

      const [mart, todaysOrders] = await Promise.all([
        Users.findById(martId)
          .select('-password -__v')
          .lean(),

        Orders.countDocuments({ martId }),
      ]);

      const orderTime = moment().tz('Asia/karachi');
      const formatedTime = moment(orderTime, 'hh:mm').format('hh:mm a');

      if (order[0].address === 'Current Location') {
        order[0].address = await getAddress(userLatitude, userLongitude);
      }

      const [longitude, latitude] = mart.geometry.coordinates;
      const distance = await getDistance(
        +userLatitude,
        +userLongitude,
        latitude,
        longitude
      );

      const newOrder = await new Orders({
        ...order[0],
        paymentStatus: 'Paid',
        paymentMethod: PaymentName,
        issuerName: issuer_name,
        distance: `${distance} km`,
        address: order[0].address,
        city: mart.city,
        martId: mart._id,
        martName: mart.name,
        martPhone: mart.phone,
        martAddress: mart.martAddress,
        martLatitude: mart.latitude,
        martLongitude: mart.longitude,
        time: formatedTime,
        date,
        orderNum: todaysOrders + 1,
        dateForSearching: moment(date, 'DD-MM-YYYY')
          .tz('Asia/Karachi')
          .toISOString(),
      }).save();

      const adminMessage = `You have a new order.`;
      const userMessage = `Dear customer your order has been placed.`;
      const info = `New Order for ${mart.name} placed by ${order[0].name}`;

      const { playerIds: restaurantPlayerIds } = mart;
      restaurantPlayerIds.forEach(async playerId => {
        notifyAdmin(info, adminMessage, playerId, {
          flag: 'adminReceived',
        });
      });

      const [user, admins] = await Promise.all([
        Users.findById(order[0].userId).select('-password -__v'),

        Users.find({
          adminType: { $in: ['admin', 'super admin'] },
          status: 'active',
          city: mart.city,
        })
          .select('superAdminPlayerId')
          .lean(),
      ]);

      await notifyUser(userMessage, user.playerId, { flag: 'orderDelivered' });

      const msg = `Dear Dastak user, your order has been received. Please wait while the restaurant accepts your order.`;
      await axios.get(
        `${process.env.OTP_URL}&to=${92 +
          user.phone.substring(1, 11)}&message=${msg}`
      );

      admins.forEach(admin => {
        notifySuperAdmin(info, adminMessage, admin.superAdminPlayerId, {
          flag: 'adminReceived',
        });
      });

      if (paymentType === 'split') {
        user.wallet.amount -= walletAmount;

        const history = {
          type: 'Deduction',
          amount: walletAmount,
          userId: user._id,
          orderId: newOrder._id,
          time: moment()
            .tz('Asia/karachi')
            .format('DD-MM-YYYY hh:mm a'),
        };

        await new WalletHistory(history).save();
      }

      await user.save();

      const count = products.reduce((a, b) => a + b.count, 0);

      if (mart.email && mart.email !== '' && user.email.includes('@')) {
        notifyRestaurantByEmail(mart.email);
      }

      emailOrderDetails(
        mart,
        user,
        formatedTime,
        order[0].address,
        products,
        count,
        orderTotal
      );

      if (user.email && user.email !== '' && user.email.includes('@')) {
        emailOrderDetailsToCustomer(
          user,
          mart,
          date,
          orderTotal,
          order[0].address,
          products,
          count
        );
      }

      await Users.findByIdAndUpdate(order[0].userId, { onlineOrder: [] });

      return res.status(200).send();
    }

    return res.status(404).send();
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
