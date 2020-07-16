const mongoose = require('mongoose');

const userModel = mongoose.Schema(
  {
    status: String,
    name: String,
    phone: String,
    password: String,
    email: String,
    address: String,
    playerId: String,
    type: {
      type: String,
      default: 'user',
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('users', userModel);
