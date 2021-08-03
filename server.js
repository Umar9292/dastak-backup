require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');
const { join } = require('path');
const { config } = require('cloudinary');
const compression = require('compression');
const { connect } = require('mongoose');
const { createServer } = require('http');
const socketIo = require('socket.io');
const redis = require('socket.io-redis');

const signUpRouter = require('./src/routes/user/signUp');
const profileRouter = require('./src/routes/user/profle');
const productsRouter = require('./src/routes/products/products');
const productImageRouter = require('./src/routes/admin/productImage');
const ordersRouter = require('./src/routes/admin/orders');
const logoutRouter = require('./src/routes/user/logout');
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

const { dbUrl } = require('./utils/dbUrls');

const port = process.env.PORT || 8080;

const app = express();

const server = createServer(app);
const io = socketIo(server, {
  transports: ['websocket'],
});
io.adapter(redis(process.env.REDIS_URL));

server.listen(port, () => console.log(`Listening on port ${port}\n`));

exports.emitMessage = chat => {
  io.emit('newMessage', chat);
};

const chatRouter = require('./src/routes/chat/chat');

app.disable('etag');
app.disable('x-powered-by');

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, 'views')));

app.use(
  '/user',
  signUpRouter,
  profileRouter,
  logoutRouter,
  usersReviewRouter,
  otpVerificationRouter
);
app.use('/orders', ordersRouter);
app.use('/marts', martsRouter);
app.use('/app', appVersionRouter);
app.use('/general', playerIdRouter, generalApisRouter);
app.use('/products', productsRouter, productImageRouter);
app.use('/chat', chatRouter);
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
  adminAutorizationRouter
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

config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// module.exports = app;
