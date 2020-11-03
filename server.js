require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const logger = require('morgan');
const path = require('path');
const cloudinary = require('cloudinary');

const dbUrl = require('./utils/dbUrls');
const signUpRouter = require('./src/routes/user/signUp');
const profileRouter = require('./src/routes/user/profle');
const productsRouter = require('./src/routes/products/products');
const pricingRouter = require('./src/routes/admin/productPricing');
const addProductsRouter = require('./src/routes/admin/addProducts');
const productImageRouter = require('./src/routes/admin/productImage');
const ordersRouter = require('./src/routes/admin/orders');
const logoutRouter = require('./src/routes/user/logout');
const martsRouter = require('./src/routes/marts/marts');
const appVersionRouter = require('./src/routes/general/appVersion');
const playerIdRouter = require('./src/routes/general/playerIds');

const port = process.env.PORT || 8080;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/user', signUpRouter, profileRouter, logoutRouter);
app.use(
  '/products',
  productsRouter,
  pricingRouter,
  addProductsRouter,
  productImageRouter
);
app.use('/orders', ordersRouter);
app.use('/admin', playerIdRouter);
app.use('/marts', martsRouter);
app.use('/app', appVersionRouter);
app.use('/general', playerIdRouter);

const options = {
  host: 'dastakbackend.herokuapp.com',
  // host: 'martbackend.herokuapp.com',
};
const request = () => {
  http
    .get(options, function(res) {
      res.on('data', function() {
        console.log('Working');
      });
    })
    .on('error', function(e) {
      console.log(`Got error: ${e.message}`);
    });
};
setInterval(request, 1500000);

mongoose.connect(
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
      app.listen(port, () => console.log(`Listening on port ${port}\n`));

      console.log('Connected to databse');
    }
  }
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

module.exports = app;
