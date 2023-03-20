const { Schema, model } = require('mongoose');

const randomVouchersModel = Schema(
  {
    name: String,
    used: Boolean,
    amount: Number,
    minimumAmount: Number,
    validTill: String,
    voucherCode: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('random vouchers', randomVouchersModel);
