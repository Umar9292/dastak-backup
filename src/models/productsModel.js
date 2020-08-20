const mongoose = require('mongoose');

const productsModel = mongoose.Schema(
  {
    martId: String,
    available: {
      default: 'in stock',
      type: String,
    },
    productName: String,
    price: Number,
    category: String,
    quantity: String,
    net: Number,
    count: Number,
    type: String,
    flavours: Object,
    drinks: Boolean,
    allDrinks: Object,
    sizes: Object,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('products', productsModel);
