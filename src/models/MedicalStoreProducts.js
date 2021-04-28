const { Schema, model } = require('mongoose');

const medicalStoreProducts = Schema(
  {
    martId: String,
    available: {
      default: 'in stock',
      type: String,
    },
    imgUrl: String,
    productName: String,
    price: Number,
    category: String,
    quantity: String,
    net: Number,
    count: Number,
    type: String,
    discount: String,
    discountedPrice: Number,
  },
  {
    versionKey: false,
  }
);

module.exports = model('store products', medicalStoreProducts);
