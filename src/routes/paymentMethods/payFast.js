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

// const { TOPUP_SUCCESSFUL } = process.env;

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

      Users.findByIdAndUpdate(userId, { onlineOrder: req.body }),
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

router.post('/payFast/Callback', async (req, res) => {
  const { err_code, basket_id, issuer_name, PaymentName } = req.body;

  //   const transactionType = O.substring(0, 2);

  /*  if (transactionType === 'ATO' && TS === 'F') {
    await Users.updateOne(
      { 'topUp.transactionId': O },
      { 'topUp.status': 'Failed' }
    );

    return res.redirect(TRANS_FAILED);
  }

  if (transactionType === 'ATO' && TS === 'P') {
    const user = await Users.findOne({ 'topUp.transactionId': O }).select(
      'wallet topUp'
    );

    const { actualAmount } = user.topUp;
    user.wallet.amount += actualAmount;
    user.topUp.status = 'Successful';
    await user.save();

    const topUp = {
      type: 'Top Up',
      amount: actualAmount,
      transactionId: O,
      userId: user._id,
      topUpMethod: 'Credit/Debit Card',
      time: moment()
        .tz('Asia/karachi')
        .format('MM-DD-YYYY hh:mm a'),
    };

    await new WalletHistory(topUp).save();

    return res.redirect(TOPUP_SUCCESSFUL_URL);
  }

  if (TS === 'F') {
    await Orders.deleteOne({ transactionId: O });

    return res.redirect(CARD_FAILED_URL);
  } */

  if (err_code === '000') {
    const order = await Users.findOne({
      'onlineOrder.transactionId': basket_id,
    });

    const {
      martId,
      latitude: userLatitude,
      longitude: userLongitude,
      products,
      orderTotal,
      paymentType,
      walletAmount,
    } = order;

    const date = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const [mart, todaysOrders] = await Promise.all([
      Users.findById(order.martId)
        .select('-password -__v')
        .lean(),

      Orders.countDocuments({ martId, date }),
    ]);

    const orderTime = moment().tz('Asia/karachi');
    const formatedTime = moment(orderTime, 'hh:mm').format('hh:mm a');

    if (order.address === 'Current Location') {
      order.address = await getAddress(userLatitude, userLongitude);
    }

    const [longitude, latitude] = mart.geometry.coordinates;
    const distance = await getDistance(
      +userLatitude,
      +userLongitude,
      latitude,
      longitude
    );

    await new Orders({
      ...order,
      paymentStatus: 'Paid',
      paymentMethod: PaymentName,
      issuerName: issuer_name,
      distance: `${distance} km`,
      address: order.address,
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
    const info = `New Order for ${mart.name} placed by ${order.name}`;

    const { playerIds: restaurantPlayerIds } = mart;
    restaurantPlayerIds.forEach(async playerId => {
      notifyAdmin(info, adminMessage, playerId, {
        flag: 'adminReceived',
      });
    });

    const [user, admins] = await Promise.all([
      Users.findById(order.userId).select('-password -__v'),

      Users.find({
        adminType: { $in: ['admin', 'super admin'] },
        status: 'active',
        city: mart.city,
      })
        .select('superAdminPlayerId')
        .lean(),
    ]);

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
        orderId: order._id,
        time: moment()
          .tz('Asia/karachi')
          .format('DD-MM-YYYY hh:mm a'),
      };

      await new WalletHistory(history).save();
    }

    await user.save();

    const orderProducts = JSON.parse(products);
    const count = orderProducts.reduce((a, b) => a + b.count, 0);

    if (mart.email && mart.email !== '' && user.email.includes('@')) {
      notifyRestaurantByEmail(mart.email);
    }

    emailOrderDetails(
      mart,
      user,
      formatedTime,
      order.address,
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
        order.address,
        products,
        count
      );
    }
  }
});

module.exports = router;
