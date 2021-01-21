const { Schema, model } = require('mongoose');

const ridersModel = Schema(
  {
    status: String,
    available: {
      type: Boolean,
      default: true,
    },
    name: String,
    phone: String,
    password: String,
    address: String,
    playerId: String,
    type: {
      type: String,
      default: 'rider',
    },
    cnic: String,
    orderCount: Number,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('user', ridersModel);
