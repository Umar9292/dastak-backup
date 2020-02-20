const mongoose = require('mongoose');

const productsModel = mongoose.Schema({
    name: String,
    price: String,
    category: String,
    subCategory: String,
    quantity: String
});

module.exports = mongoose.model('products', productsModel);