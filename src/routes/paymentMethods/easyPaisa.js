const Router = require('express/lib/router');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Users = require('../../models/userModel');
const Orders = require('../../models/ordersModel');

const { emitEPResponse } = require('../../../server');
const { checkTime } = require('../../checkTime/checkTime');
const { getAddress } = require('../../geoCoder/getAddress');
const { notifyAdmin } = require('../../notificationHandler/handler');
const {
  emailOrderDetailsToCustomer,
} = require('../../emailHandler/customerEmail/customerEmail');
const {
  emailOrderDetails,
  notifyRestaurantByEmail,
} = require('../../emailHandler/orderEmail/orderEmail');

const router = Router();

const easyPaisa = async (orderTotal, easyPaisaPhone, email, userId, params) => {
  const transactionId = `EP${moment()
    .tz('Asia/Karachi')
    .format('YYYYMMDD')}${crypto.randomBytes(2).toString('hex')}`;

  const data = {
    orderId: transactionId,
    storeId: process.env.EASYPAISA_STOREID,
    transactionAmount: orderTotal,
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
  console.log(responseCode);

  if (responseCode === '0001') {
    const msg =
      'Dear customer seems like you have cancelled the payment request.';
    return emitEPResponse('paymentCancelled', { msg, userId });
  }

  if (responseCode === '0002') {
    console.log('Incorrect number');
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
      latitude,
      longitude,
      orderType,
      deliveryCharges,
    } = params;

    const date = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const [mart, { employee }, todaysOrders] = await Promise.all([
      Users.findById(martId)
        .select('-password -__v')
        .lean(),

      Users.findById(userId)
        .select('employee')
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
      deliveryCharges:
        employee !== undefined || orderType === 'pickUp'
          ? '0'
          : deliveryCharges,
      date,
      orderNum: todaysOrders + 1,
      orderTotal:
        employee !== undefined && orderType !== 'PickUp'
          ? orderTotal - deliveryCharges
          : orderTotal,
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

    const user = await Users.findById(userId).select('-password -__v');

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
    const { orderTotal, easyPaisaPhone, email, martId, userId } = req.body;
    // const Credentials = Buffer.from(
    //   'Dastak:7ed6bcb0da9fd70ee294c1595c037e01'
    // ).toString('base64');

    const restaurantIsOpen = await checkTime(martId);

    if (!restaurantIsOpen) {
      return res.json({
        status: '404',
        msg: 'Sorry, the restaurant got closed.',
      });
    }

    res.json({ status: '200', msg: 'Your payment is being processed.' });

    easyPaisa(orderTotal, easyPaisaPhone, email, userId, req.body);
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
