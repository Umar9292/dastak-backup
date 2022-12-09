const { Schema, model } = require('mongoose');

const otpModel = Schema(
  {
    phone: String,
    secret: String,
    otp: String,
    expireAt: {
      type: Date,
      default: Date.now,
      index: { expires: '1m' },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('otp keys', otpModel);
