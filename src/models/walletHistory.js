const { Schema, model } = require('mongoose');

const walletHistoryModel = Schema(
  {
    type: String,
    amount: Number,
    time: String,
    userId: String,
    topUpMethod: String,
    issuerName: String,
    easyPaisaPhone: String,
    transactionId: String,
    orderId: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('wallet history', walletHistoryModel);
