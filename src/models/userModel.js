const mongoose = require('mongoose');
const moment = require('moment-timezone');

const pakistanTime = moment()
  .tz('Asia/Karachi')
  .format('YYYY-MM-DD hh:mma');

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
    created: {
      type: String,
      default: pakistanTime,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('users', userModel);
