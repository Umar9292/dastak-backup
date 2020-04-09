const mongoose = require('mongoose');

const productsModel = mongoose.Schema({
    martId: String,
    title: String,
    price: Number,
    category: String,
    categoryTitle: String,
    categoryImg: String,
    img: String,
    quantity: String,
    net: Number,
    count: Number
}, {
    versionKey: false
});

module.exports = mongoose.model('products', productsModel); 