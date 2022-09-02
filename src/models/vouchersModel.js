const { Schema, model } = require('mongoose');

const vouchersModel = Schema(
  {
    userId: String,
    vouchers: [
      {
        name: String,
        used: Boolean,
        amount: Number,
        validTill: String,
        voucherCode: String,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('vouchers', vouchersModel);
