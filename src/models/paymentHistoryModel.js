const { Schema, model } = require('mongoose');

const paymentHistoryModel = Schema(
  {
    martId: String,
    startDate: String,
    endDate: String,
    paidAmount: String,
    orderCount: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('payment histories', paymentHistoryModel);
