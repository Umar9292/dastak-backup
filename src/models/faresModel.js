const { Schema, model } = require('mongoose');

const orderFares = Schema(
  {
    city: String,
    deliveryCharges: Array,
    riderFares: Array,
    platformFee: Number,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('fares', orderFares);
