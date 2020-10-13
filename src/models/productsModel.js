const mongoose = require('mongoose');

const productsModel = mongoose.Schema(
  {
    martId: String,
    available: {
      default: 'in stock',
      type: String,
    },
    productName: String,
    regular: Boolean,
    lunchTimeStart: String,
    lunchTimeEnd: String,
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
    randomOffer: Boolean,
    discount: String,
    discountedPrice: Number,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('products', productsModel);
