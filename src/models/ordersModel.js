const mongoose = require('mongoose');

const ordersModel = mongoose.Schema(
  {
    userId: String,
    martId: String,
    orderNum: String,
    martName: String,
    riderId: String,
    riderName: String,
    riderPhone: String,
    deliveryCharges: String,
    name: String,
    phone: String,
    reason: String,
    address: String,
    date: String,
    time: String,
    products: Object,
    orderTotal: Number,
    deliveryCharges: String,
    orderType: String,
    martPhone: String,
    martAddress: String,
    status: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('orders', ordersModel);
