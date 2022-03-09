const Router = require('express/lib/router');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');

const { getAddress } = require('../../geoCoder/getAddress');
const { notifyAdmin } = require('../../notificationHandler/handler');
const {
  emailOrderDetails,
  notifyRestaurantByEmail,
} = require('../../emailHandler/orderEmail/orderEmail');
const {
  emailOrderDetailsToCustomer,
} = require('../../emailHandler/customerEmail/customerEmail');

const {
  ALFA_KEY_1,
  ALFA_KEY_2,
  ALFA_CHANNEL_ID,
  ALFA_RETURN_URL,
  ALFA_MERCHANT_ID,
  ALFA_STORE_ID,
  ALFA_MERCHANT_HASH,
  ALFA_MERCHANT_USERNAME,
  ALFA_MERCHANT_PASSWORD,
  ALFA_HANDSHAKE_URL,
} = process.env;

const router = Router();

router.post('/v1/card', async (req, res) => {
  try {
    const { orderTotal } = req.body;

    const transactionId = `A${moment()
      .tz('Asia/Karachi')
      .format('YYYYMMDD')}${crypto.randomBytes(2).toString('hex')}`;

    req.body.transactionId = transactionId;
    await new Orders(req.body).save();

    const handShakeString = `HS_ChannelId=${ALFA_CHANNEL_ID}&HS_MerchantId=${ALFA_MERCHANT_ID}&HS_StoreId=${ALFA_STORE_ID}&HS_MerchantHash=${ALFA_MERCHANT_HASH}&HS_MerchantUsername=${ALFA_MERCHANT_USERNAME}&HS_MerchantPassword=${ALFA_MERCHANT_PASSWORD}&HS_ReturnURL=${ALFA_RETURN_URL}&HS_IsRedirectionRequest=0&HS_TransactionReferenceNumber=${transactionId}`;

    const handShakeCipher = crypto.createCipheriv(
      'AES-128-CBC',
      ALFA_KEY_1,
      ALFA_KEY_2
    );
    const handShakeHash =
      handShakeCipher.update(handShakeString, 'utf8', 'base64') +
      handShakeCipher.final('base64');

    const handShakeData = {
      HS_RequestHash: handShakeHash,
      HS_IsRedirectionRequest: '0',
      HS_ChannelId: ALFA_CHANNEL_ID,
      HS_ReturnURL: ALFA_RETURN_URL,
      HS_MerchantId: ALFA_MERCHANT_ID,
      HS_StoreId: ALFA_STORE_ID,
      HS_MerchantHash: ALFA_MERCHANT_HASH,
      HS_MerchantUsername: ALFA_MERCHANT_USERNAME,
      HS_MerchantPassword: ALFA_MERCHANT_PASSWORD,
      HS_TransactionReferenceNumber: transactionId,
    };

    const result = await axios.post(ALFA_HANDSHAKE_URL, handShakeData);
    const { AuthToken } = result.data;

    const redirectionString = `AuthToken=${AuthToken}&ChannelId=${ALFA_CHANNEL_ID}&Currency=PKR&IsBIN=0&ReturnURL=${ALFA_RETURN_URL}&MerchantId=${ALFA_MERCHANT_ID}&StoreId=${ALFA_STORE_ID}&MerchantHash=${ALFA_MERCHANT_HASH}&MerchantUsername=${ALFA_MERCHANT_USERNAME}&MerchantPassword=${ALFA_MERCHANT_PASSWORD}&TransactionTypeId=3&TransactionReferenceNumber=${transactionId}&TransactionAmount=${orderTotal}`;

    const cipher = crypto.createCipheriv('AES-128-CBC', ALFA_KEY_1, ALFA_KEY_2);
    const redirectionHash =
      cipher.update(redirectionString, 'utf8', 'base64') +
      cipher.final('base64');

    return res.json({
      status: '200',
      transactionId,
      redirectionHash,
      AuthToken,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

router.get('/alfaCallback', async (req, res) => {
  const { TS, O } = req.query;

  console.log(req.query);

  if (TS === 'F') {
    await Orders.deleteOne({ transactionId: O });

    return res.redirect('https://dastakbackend.herokuapp.com/cardFailed/views');
  }

  if (TS === 'P') {
    const order = await Orders.findOne({ transactionId: O });

    const { martId, latitude, longitude, products, orderTotal } = order;

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
      order.address = await getAddress(latitude, longitude);
    }

    await Orders.updateOne(
      { transactionId: O },
      {
        paymentStatus: 'Paid',
        products: await JSON.parse(order.products),
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
      }
    );

    const adminMessage = `You have a new order.`;
    const info = `New Order for ${mart.name} placed by ${order.name}`;

    const { playerIds: restaurantPlayerIds } = mart;
    restaurantPlayerIds.forEach(async playerId => {
      await notifyAdmin(info, adminMessage, playerId, {
        flag: 'adminReceived',
      });
    });

    res.redirect('http://dastakbackend.herokuapp.com/cardSuccessful/views');

    const user = await Users.findById(order.userId).select('-password -__v');

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

router.post('/v1/checkCardPaymentStatus', async (req, res) => {
  try {
    const { transactionId } = req.body;

    let result = await axios.get(
      `${process.env.ALFA_IPN_URL}/${transactionId}`
    );

    result = JSON.parse(result.data);
    const { ResponseCode, TransactionStatus } = result;

    if (ResponseCode === '00' && TransactionStatus === 'Paid') {
      return res.json({ status: '200', msg: 'Your order has been placed.' });
    }

    res.json({ status: '404' });
    await Orders.deleteOne({ transactionId });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
