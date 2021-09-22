const { Schema, model } = require('mongoose');

const otpModel = Schema(
  {
    phone: String,
    secret: String,
    otp: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('otp keys', otpModel);
