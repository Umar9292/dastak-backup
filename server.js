const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require("morgan");
const path = require("path");

const dbUrl = require('./utils/dbUrls');
const userRouter = require('./src/routes/user/user');
const productsRouter = require('./src/routes/products/products');
const pricingRouter = require('./src/routes/admin/productPricing');
const adminCategoriesRouter = require('./src/routes/admin/categoriesAndSubCategories');
const addProductsRouter = require('./src/routes/admin/addProducts');

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "views")));

app.use('/user', userRouter);
app.use('/products', productsRouter, pricingRouter, adminCategoriesRouter, addProductsRouter);

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to databse');
    }
});

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;