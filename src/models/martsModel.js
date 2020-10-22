const mongoose = require('mongoose');

const martsModel = mongoose.Schema(
  {
    useAsCustomer: {
      type: Boolean,
      default: false,
    },
    status: String,
    available: {
      type: Boolean,
      default: true,
    },
    img: String,
    logo: String,
    name: String,
    phone: String,
    password: String,
    address: String,
    shopType: String,
    minimumOrder: Number,
    deliveryRange: String,
    openingTime: String,
    closingTime: String,
    playerId: String,
    discount: String,
    type: {
      type: String,
      default: 'admin',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('user', martsModel);
