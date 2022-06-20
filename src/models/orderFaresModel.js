const { Schema, model } = require('mongoose');

const orderFares = Schema(
  {
    city: String,
    deliveryCharges: Array,
    riderFares: Array,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('order fares', orderFares);
