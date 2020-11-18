const mongoose = require('mongoose');

const ordersModel = mongoose.Schema(
  {
    paid: {
      type: Boolean,
      default: false,
    },
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
    orderType: String,
    martPhone: String,
    martAddress: String,
    customerNotified: {
      type: Boolean,
      default: false,
    },
    status: String,
    paidToRider: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('orders', ordersModel);
