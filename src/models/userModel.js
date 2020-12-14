const mongoose = require('mongoose');

const userModel = mongoose.Schema(
  {
    status: String,
    orderFare: Number,
    dastakDeal: Boolean,
    fareType: String,
    name: String,
    phone: String,
    password: String,
    email: {
      type: String,
      default: '',
    },
    address: {
      type: Array,
      default: [],
    },
    playerId: String,
    type: {
      type: String,
      default: 'user',
    },
    position: Number,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('users', userModel);
