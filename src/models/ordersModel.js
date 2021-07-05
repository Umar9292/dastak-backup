const { Schema, model } = require('mongoose');

const ordersModel = Schema(
  {
    paid: {
      type: Boolean,
      default: false,
    },
    collectionSubmitted: {
      type: Boolean,
      default: false,
    },
    city: String,
    assignedBy: String,
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
    reason: {
      type: String,
      default: '',
    },
    address: String,
    date: String,
    dateForSearching: Date,
    time: String,
    timeWhenDelivered: String,
    pickUpTime: String,
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
    riderFare: Number,
    paidToRider: {
      type: Boolean,
      default: false,
    },
    latitude: String,
    longitude: String,
    martLatitude: String,
    martLongitude: String,
    createdAt: Date,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('orders', ordersModel);
