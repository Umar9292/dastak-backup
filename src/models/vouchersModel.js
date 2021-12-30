const { Schema, model } = require('mongoose');

const vouchersModel = Schema(
  {
    voucherCode: String,
    expiry: String,
    amount: String,
    used: Boolean,
  },
  {
    versionKey: false,
  }
);

module.exports = model('vouchers', vouchersModel);
