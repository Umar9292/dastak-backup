import { Schema, model } from 'mongoose';

const productsModel = Schema(
  {
    martId: String,
    available: {
      default: 'in stock',
      type: String,
    },
    dastakDeal: Boolean,
    restaurant: Object,
    imgUrl: String,
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

export default model('products', productsModel);
