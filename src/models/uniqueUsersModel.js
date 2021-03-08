const { Schema, model } = require('mongoose');

const uniqueUsersModel = Schema(
  {
    users: Array,
    userCount: Number,
  },
  {
    versionKey: false,
  }
);

module.exports = model('unique users', uniqueUsersModel);
