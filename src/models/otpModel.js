const { Schema, model } = require('mongoose');

const otpModel = Schema(
  {
    userId: String,
    email: String,
    secret: String,
    token: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('otp keys', otpModel);
