import express, { json, urlencoded } from 'express';
import { connect } from 'mongoose';
import { urlencoded as _urlencoded, json as _json } from 'body-parser';
import { get } from 'http';
import cors from 'cors';
import logger from 'morgan';
import helmet from 'helmet';
import { join } from 'path';
import { config } from 'cloudinary';
import './env';

import { dbUrl } from './utils/dbUrls';
import signUpRouter from './src/routes/user/signUp';
import profileRouter from './src/routes/user/profle';
import productsRouter from './src/routes/products/products';
import productImageRouter from './src/routes/admin/productImage';
import ordersRouter from './src/routes/admin/orders';
import logoutRouter from './src/routes/user/logout';
import martsRouter from './src/routes/marts/marts';
import appVersionRouter from './src/routes/general/appVersion';
import playerIdRouter from './src/routes/general/playerIds';
import generalApisRouter from './src/routes/general/generalApis';
import ordersManagementRouter from './src/routes/admin/dashboard/orderManagement';

const port = process.env.PORT || 8080;

const app = express();

app.disable('etag');
app.disable('x-powered-by');

app.use(helmet());
app.use(cors());
app.use(_urlencoded({ extended: false }));
app.use(_json());
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(express.static(join(__dirname, 'views')));

app.use('/user', signUpRouter, profileRouter, logoutRouter);
app.use('/orders', ordersRouter);
app.use('/admin', playerIdRouter, ordersManagementRouter);
app.use('/marts', martsRouter);
app.use('/app', appVersionRouter);
app.use('/general', playerIdRouter, generalApisRouter);
app.use('/products', productsRouter, productImageRouter);

const options = {
  host: 'dastakbackend.herokuapp.com',
  // host: 'martbackend.herokuapp.com',
};
const request = () => {
  get(options, function(res) {
    res.on('data', function() {
      console.log('Working');
    });
  }).on('error', function(e) {
    console.log(`Got error: ${e.message}`);
  });
};
setInterval(request, 1500000);

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
      app.listen(port, () => console.log(`Listening on port ${port}\n`));

      console.log('Connected to databse');
    }
  }
);

config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default app;
