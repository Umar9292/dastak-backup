require('dotenv').config();
const express = require('express');
const { connect, connection } = require('mongoose');
const bodyParser = require('body-parser');
const { createServer } = require('http');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');
const { join } = require('path');
// const { config } = require('cloudinary');
const compression = require('compression');
const redis = require('socket.io-redis');

const { dbUrl } = require('./utils/dbUrls');
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
const chatRouter = require('./src/routes/chat/chat');

const { notifyUser } = require('./src/notificationHandler/handler');

const userModel = require('./src/models/userModel');
const Chats = require('./src/models/chatModel');

const port = process.env.PORT || 8080;

const app = express();
const server = createServer(app);
// eslint-disable-next-line import/order
const io = require('socket.io')(server);

io.adapter(redis({ host: 'localhost', port: 6379 }));

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
  updateProductRouter
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
      server.listen(port, () => console.log(`Listening on port ${port}\n`));

      console.log('Connected to database');
    }
  }
);

connection.once('open', () => {
  console.log('Setting change streams');
  const ordersChangeStream = connection.collection('orders').watch();
  const chatChangeStream = connection.collection('chats').watch();

  chatChangeStream.on('change', async change => {
    if (change.operationType === 'insert') {
      const { fullDocument } = change;

      io.emit('newMessage', fullDocument);

      const { chat, userId, riderId } = fullDocument;
      const msg = `New message from ${chat[0].type}: ${chat[0].txt}`;

      if (chat[0].type === 'user') {
        const { playerId } = await userModel
          .findById(riderId)
          .select('playerId')
          .lean();

        await notifyUser(msg, playerId, { flag: 'riderMsg' });
      } else {
        const { playerId } = await userModel
          .findById(userId)
          .select('playerId')
          .lean();

        await notifyUser(msg, playerId, { flag: 'userMsg' });
      }
    }

    if (change.operationType === 'update') {
      const { documentKey, updateDescription } = change;

      const { chat } = updateDescription.updatedFields;

      const fullDcocument = await Chats.findById(documentKey._id).lean();
      io.emit('newMessage', fullDcocument);

      console.log(fullDcocument.length);

      const msg = `New message from ${chat[0].type}: ${
        chat[chat.length - 1].txt
      }`;

      const { userId, riderId } = await Chats.findById(documentKey._id)
        .select('userId riderId')
        .lean();

      if (chat[chat.length - 1].type === 'user') {
        const { playerId } = await userModel
          .findById(riderId)
          .select('playerId')
          .lean();

        await notifyUser(msg, '70c3917b-3e8c-4d40-b4b3-65ded06a5534', {
          flag: 'riderMsg',
        });
      } else {
        const { playerId } = await userModel
          .findById(userId)
          .select('playerId')
          .lean();

        await notifyUser(msg, '70c3917b-3e8c-4d40-b4b3-65ded06a5534', {
          flag: 'userMsg',
        });
      }
    }
  });

  ordersChangeStream.on('change', async change => {
    if (
      change.operationType === 'update' &&
      change.updateDescription.updatedFields.orderTotal !== undefined
    ) {
      const { documentKey, updateDescription } = change;
      const msg = `Order total of order id ${documentKey._id} got changed to ${updateDescription.updatedFields.orderTotal}`;
      console.log('Here is the problem\n');
      await notifyUser(msg, '70c3917b-3e8c-4d40-b4b3-65ded06a5534', {});
    }
  });
});

module.exports = app;
