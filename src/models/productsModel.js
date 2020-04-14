const mongoose = require('mongoose');

const productsModel = mongoose.Schema(
    {
        martId: String,
        productName: String,
        price: Number,
        productImg: String,
        mainCategory: String,
        mainCategoryImg: String,
        subCategory: String,
        subCategoryImg: String,
        quantity: String,
        net: Number,
        count: Number
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('products', productsModel); 