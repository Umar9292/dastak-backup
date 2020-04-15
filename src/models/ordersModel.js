const mongoose = require('mongoose');

const ordersModel = mongoose.Schema({
    userId: String,
    martId: String,
    martName: String,
    name: String,
    phone: String,
    address: String,
    date: String,
    time: String,
    products: Object,
    martPhone: String,
    martAddress: String,
    status: {
        type: String,
        status: 'pending'
    }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('orders', ordersModel);