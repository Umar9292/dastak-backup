const { Schema, model } = require('mongoose');

const riderWalletHistory = Schema(
  {
    startDate: String,
    endDate: String,
    amount: Number,
    riderId: String,
    admin: String,
    orderCount: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model('rider wallet history', riderWalletHistory);
