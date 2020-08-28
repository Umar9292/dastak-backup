const mongoose = require('mongoose');

const userModel = mongoose.Schema(
  {
    status: String,
    name: String,
    phone: String,
    password: String,
    email: {
      type: String,
      default: '',
    },
    address: {
      type: Object,
      default: [],
    },
    playerId: String,
    type: {
      type: String,
      default: 'user',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('users', userModel);
