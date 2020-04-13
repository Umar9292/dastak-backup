const mongoose = require('mongoose');

const productsModel = mongoose.Schema(
    {
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

module.exports = mongoose.model('iffy mart', productsModel); 