const { Schema, model } = require('mongoose');

const signupCount = Schema(
  {
    signupCount: Number,
    totalAmount: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model('voucher signups', signupCount);
