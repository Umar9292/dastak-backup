const mongoose = require('mongoose');

const ordersModel = mongoose.Schema({
    userId: String,
    name: String,
    phone: String,
    address: String,
    date: String,
    products: Object,
    status: {
        type: String,
        status: 'pending'
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('orders', ordersModel); 