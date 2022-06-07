const Router = require('express/lib/router');
/* const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Users = require('../../models/userModel');
const Orders = require('../../models/ordersModel');
const WalletHistory = require('../../models/walletHistory');

const { emitEPResponse } = require('../../../server');
const { checkTime } = require('../../checkTime/checkTime');
const { getAddress } = require('../../geoCoder/getAddress');
const {
  notifyAdmin,
  notifySuperAdmin,
} = require('../../notificationHandler/handler');
const {
  emailOrderDetailsToCustomer,
} = require('../../emailHandler/customerEmail/customerEmail');
const {
  emailOrderDetails,
  notifyRestaurantByEmail,
} = require('../../emailHandler/orderEmail/orderEmail'); */

const router = Router();

/* const easyPaisa = async params => {
  const {
    orderTotal,
    easyPaisaPhone,
    email,
    userId,
    paymentType,
    onlineAmount,
    walletAmount,
  } = params;

  const transactionId = `EP${moment()
    .tz('Asia/Karachi')
    .format('YYYYMMDD')}${crypto.randomBytes(2).toString('hex')}`;

  const data = {
    orderId: transactionId,
    storeId: process.env.EASYPAISA_STOREID,
    transactionAmount: paymentType === 'split' ? onlineAmount : orderTotal,
    transactionType: 'MA',
    mobileAccountNo: easyPaisaPhone,
    emailAddress: email,
  };

  const result = await axios.post(process.env.EASYPAISA_PROD_URL, data, {
    headers: {
      Credentials: process.env.EASYPAISA_CREDENTIALS,
    },
  });

  const { responseCode } = result.data;

  console.log('Easy Paisa ResponseCode: ', responseCode);

  if (responseCode === '0001') {
    const msg =
      'Dear customer seems like you have cancelled the payment request.';
    return emitEPResponse('paymentCancelled', { msg, userId });
  }

  if (responseCode === '0002') {
    const msg = 'Dear customer the phone number you have entered is incorrect.';
    return emitEPResponse('incorrectNumber', { msg, userId });
  }

  if (responseCode === '0013') {
    const msg =
      'Dear customer your tranasction could not be completed because you dont have sufficient balance in your account right now.';
    return emitEPResponse('insufficientBalance', { msg, userId });
  }

  if (responseCode === '0000') {
    const successMsg =
      'Payment processed successfully. Your order has been placed.';
    emitEPResponse('paymentSuccessful', { successMsg, userId });

    const { martId, products, latitude, longitude } = params;

    const date = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const [mart, todaysOrders] = await Promise.all([
      Users.findById(martId)
        .select('-password -__v')
        .lean(),

      Orders.countDocuments({ martId, date }),
    ]);

    const orderTime = moment().tz('Asia/karachi');
    const formatedTime = moment(orderTime, 'hh:mm').format('hh:mm a');

    if (params.address === 'Current Location') {
      params.address = await getAddress(latitude, longitude);
    }

    const orderData = {
      ...params,
      transactionId,
      products: await JSON.parse(products),
      city: mart.city,
      martId: mart._id,
      martName: mart.name,
      martPhone: mart.phone,
      martAddress: mart.martAddress,
      time: formatedTime,
      date,
      orderNum: todaysOrders + 1,
      dateForSearching: moment(date, 'DD-MM-YYYY')
        .tz('Asia/Karachi')
        .toISOString(),
    };

    const order = await new Orders(orderData).save();

    const adminMessage = `You have a new order from ${mart.city}`;
    const info = `New Order for ${params.martName} placed by ${order.name}`;

    const { playerIds: restaurantPlayerIds } = mart;
    restaurantPlayerIds.forEach(async playerId => {
      await notifyAdmin(info, adminMessage, playerId, {
        flag: 'adminReceived',
      });
    });

    const [user, admins] = await Promise.all([
      Users.findById(userId).select('-password -__v'),

      Users.find({
        adminType: { $in: ['admin', 'super admin'] },
        status: 'active',
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
      user.save();

      const history = {
        type: 'Deduction',
        amount: walletAmount,
        userId,
        orderId: order._id,
        time: moment()
          .tz('Asia/karachi')
          .format('DD-MM-YYYY hh:mm a'),
      };

      new WalletHistory(history).save();
    }

    const count = orderData.products.reduce((a, b) => a + b.count, 0);

    if (mart.email && mart.email !== '' && user.email.includes('@')) {
      notifyRestaurantByEmail(mart.email);
    }

    emailOrderDetails(
      mart,
      user,
      formatedTime,
      params.address,
      params.products,
      count,
      params.orderTotal
    );

    if (user.email && user.email !== '' && user.email.includes('@')) {
      emailOrderDetailsToCustomer(
        user,
        mart,
        params.date,
        params.orderTotal,
        params.address,
        params.products,
        count
      );
    }
  }

  const msg = 'System error. Kindly try again.';
  return emitEPResponse('systemError', msg);
}; */

router.post('/v1/easyPaisa', async (req, res) => {
  try {
    // const { martId } = req.body;

    return res.json({
      status: '404',
      msg:
        'There is some technical issue with Easypaisa. We are working hard to get it back up as soon as possible. You can still use card payments or COD. Thankyou for your paitience',
    });

    /* const restaurantIsOpen = await checkTime(martId);

    if (!restaurantIsOpen) {
      return res.json({
        status: '404',
        msg: 'Sorry, the restaurant got closed.',
      });
    }

    res.json({ status: '200', msg: 'Your payment is being processed.' });

    easyPaisa(req.body); */
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
