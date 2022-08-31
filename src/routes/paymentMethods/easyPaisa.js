const Router = require('express/lib/router');
const axios = require('axios');
const crypto = require('crypto');
const Speakeasy = require('speakeasy');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Users = require('../../models/userModel');
const Orders = require('../../models/ordersModel');
const Otp = require('../../models/otpModel');
const WalletHistory = require('../../models/walletHistory');

const { emitEPResponse } = require('../../../server');
const { checkTime } = require('../../checkTime/checkTime');
const { getAddress } = require('../../geoCoder/getAddress');
const { getDistance } = require('../../geoCoder/getDistance');
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
} = require('../../emailHandler/orderEmail/orderEmail');

const router = Router();

const easyPaisa = async params => {
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

    const {
      martId,
      products,
      latitude: userLatitude,
      longitude: userLongitude,
    } = params;

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
      params.address = await getAddress(userLatitude, userLongitude);
    }

    const [longitude, latitude] = mart.geometry.coordinates;
    const distance = await getDistance(
      +userLatitude,
      +userLongitude,
      latitude,
      longitude
    );

    const orderData = {
      ...params,
      transactionId,
      products: await JSON.parse(products),
      distance: `${distance} km`,
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
        userId,
        orderId: order._id,
        time: moment()
          .tz('Asia/karachi')
          .format('DD-MM-YYYY hh:mm a'),
      };

      await new WalletHistory(history).save();
    }

    await user.save();

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
};

router.post('/v1/easyPaisa', async (req, res) => {
  try {
    const { martId, easyPaisaPhone, otp } = req.body;

    const restaurantIsOpen = await checkTime(martId);

    if (!restaurantIsOpen) {
      return res.json({
        status: '404',
        msg: 'Sorry, the restaurant got closed.',
      });
    }

    const doc = await Otp.findOne({ phone: easyPaisaPhone, otp }).select(
      'secret'
    );

    if (!doc) {
      return res.json({
        status: '404',
        msg: `Sorry you've entered the wrong verification code.`,
      });
    }

    const { secret } = doc;
    const verified = Speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: otp,
      window: 3,
    });

    if (!verified) {
      return res.json({
        status: '404',
        msg: 'Your code is no longer valid. Kindly resend the code',
      });
    }

    res.json({ status: '200', msg: 'Your payment is being processed.' });

    easyPaisa(req.body);
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
