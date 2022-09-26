require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');
const { join } = require('path');
// const { config } = require('cloudinary');
const compression = require('compression');
const { connect } = require('mongoose');
const { createServer } = require('http');
const socketIo = require('socket.io');
const redis = require('socket.io-redis');

const profileRouter = require('./src/routes/user/profle');
const productsRouter = require('./src/routes/products/products');
const productImageRouter = require('./src/routes/admin/productImage');
const ordersRouter = require('./src/routes/admin/orders');
const martsRouter = require('./src/routes/marts/marts');
const appVersionRouter = require('./src/routes/general/appVersion');
const playerIdRouter = require('./src/routes/general/playerIds');
const generalApisRouter = require('./src/routes/general/generalApis');
const ordersManagementRouter = require('./src/routes/admin/dashboard/orderManagement');
const ridersManagementRouter = require('./src/routes/admin/dashboard/riderManagement');
const restaurantsManagementRouter = require('./src/routes/admin/dashboard/restaurantManagement');
const usersManagementRouter = require('./src/routes/admin/dashboard/userManagement');
const usersReviewRouter = require('./src/routes/user/addReview');
const adminSignInRouter = require('./src/routes/admin/dashboard/adminSignIn');
const adminAutorizationRouter = require('./src/routes/admin/dashboard/adminAuthorization');
const medicalStoresRouter = require('./src/routes/stores/stores');
const storeProductsRouter = require('./src/routes/stores/storeProducts');
const updateProductRouter = require('./src/routes/stores/updatePrices');
const otpVerificationRouter = require('./src/routes/user/otpVerification');
const uploadPrescription = require('./src/routes/stores/uploadPrescription');
const deliveryChargesRouter = require('./src/routes/user/deliveryCharges');
const vouchersRouter = require('./src/routes/user/vouchers');
// const cardRouter = require('./src/routes/paymentMethods/creditDebitCard');
const dastakWalletRouter = require('./src/routes/dastakWallet/dastakWallet');
// const cardTopUpRouter = require('./src/routes/dastakWallet/walletTopUp/cardTopUp');
const ridersShiftRouter = require('./src/routes/rider/addShift');
const riderSignupRouter = require('./src/routes/admin/dashboard/riderSignUp');
const easyPaisaOtpRouter = require('./src/routes/paymentMethods/easyPaisaOtp');
const riderStatusRouter = require('./src/routes/rider/riderStatus');
const payFastRouter = require('./src/routes/paymentMethods/payFast');
const payFastTopupRouter = require('./src/routes/dastakWallet/walletTopUp/payFastTopup');

// const Users = require('./src/models/userModel');
const { dbUrl } = require('./utils/dbUrls');
// const { notifyUser } = require('./src/notificationHandler/handler');

const port = process.env.PORT || 8080;

const app = express();

const server = createServer(app);
const io = socketIo(server, {
  transports: ['websocket'],
});
// io.adapter(
//   redis(process.env.REDIS_URL, { tls: { rejectUnauthorized: false } })
// );
io.adapter(redis(process.env.REDIS_URL));

server.listen(port, () => console.log(`Listening on port ${port}\n`));

exports.emitEPResponse = (event, data) => {
  io.emit(event, data);
};

const easyPaisaRouter = require('./src/routes/paymentMethods/easyPaisa');
const easyPaisaTopUpRouter = require('./src/routes/dastakWallet/walletTopUp/easyPaisaTopUp');

app.disable('etag');
app.disable('x-powered-by');

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, 'views')));

app.use('/orders', ordersRouter);
app.use('/marts', martsRouter);
app.use('/app', appVersionRouter);
app.use('/general', playerIdRouter, generalApisRouter);
app.use('/products', productsRouter, productImageRouter);
app.use('/dastakWallet', dastakWalletRouter);
app.use('/rider', ridersShiftRouter, riderStatusRouter);
app.use(
  '/paymentMethod',
  easyPaisaRouter,
  // cardRouter,
  // cardTopUpRouter,
  easyPaisaTopUpRouter,
  easyPaisaOtpRouter,
  payFastRouter,
  payFastTopupRouter
);
app.use(
  '/user',
  profileRouter,
  usersReviewRouter,
  otpVerificationRouter,
  deliveryChargesRouter,
  vouchersRouter
);
app.use(
  '/stores',
  medicalStoresRouter,
  storeProductsRouter,
  updateProductRouter,
  uploadPrescription
);
app.use(
  '/admin',
  playerIdRouter,
  ordersManagementRouter,
  ridersManagementRouter,
  restaurantsManagementRouter,
  usersManagementRouter,
  adminSignInRouter,
  adminAutorizationRouter,
  riderSignupRouter
);

connect(
  dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log('Connected to database');
    }
  }
);

/* connection.once('open', () => {
  const changeStream = connection.collection('users').watch();

  changeStream.on('change', async change => {
    if (change.operationType === 'update') {
      const { documentKey, updateDescription } = change;

      const { name, orderCount } = await Users.findById(documentKey._id);

      if (updateDescription.updatedFields.orderCount < 0) {
        const msg = `Order count in minus for rider ${name} i.e ${orderCount}`;
        notifyUser(msg, '378fa662-adc7-49b7-a560-efa4f653e887', {});
        notifyUser(msg, 'ac6d647f-e496-408c-bc3b-6cb442578258', {});
      }
    }
  });
}); */

/* config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
 */

// module.exports = app;
