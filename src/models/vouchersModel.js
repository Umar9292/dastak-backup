const { Schema, model } = require('mongoose');

const vouchersModel = Schema(
  {
    userId: String,
    vouchers: [
      {
        name: String,
        used: {
          type: Boolean,
          default: false,
        },
        amount: Number,
        validTill: String,
        miniumAmount: Number,
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
