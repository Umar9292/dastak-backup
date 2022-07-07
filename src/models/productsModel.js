const { Schema, model } = require('mongoose');

const productsModel = Schema(
  {
    martId: String,
    available: {
      default: 'in stock',
      type: String,
    },
    maxCount: Number,
    startTime: String,
    endTime: String,
    actualPrice: Number,
    dealFlavours: Boolean,
    dastakDeal: Boolean,
    restaurant: Object,
    imgUrl: String,
    productName: String,
    pickupDeal: Boolean,
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
    dealNumber: Number,
    specifications: Array,
  },
  {
    versionKey: false,
  }
);

module.exports = model('products', productsModel);
