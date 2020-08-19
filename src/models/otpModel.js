const mongoose = require('mongoose');

const model = mongoose.Schema(
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

module.exports = mongoose.model('otp keys', model);
