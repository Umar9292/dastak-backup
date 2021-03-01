const { Schema, model } = require('mongoose');

const GeoSchema = Schema({
  type: {
    type: String,
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
  },
});

const userModel = Schema(
  {
    geometry: GeoSchema,
    status: {
      type: String,
      default: 'active',
    },
    available: Boolean,
    jazzCashNumber: String,
    orderFare: Number,
    dastakDeal: Boolean,
    fareType: String,
    altPhone: String,
    name: String,
    phone: String,
    password: String,
    tillNoonFare: Number,
    cnic: String,
    nightFare: Number,
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
    orderCount: Number,
    useAsCustomer: {
      type: Boolean,
      default: false,
    },
    pendingCollection: {
      type: Number,
      default: 0,
    },
    percentage: Number,
    shopType: String,
    minimumOrder: Number,
    deliveryCharges: String,
    deliveryRange: String,
    openingTime: String,
    closingTime: String,
    playerIds: Array,
    discount: String,
    martAddress: String,
    latitude: String,
    longitude: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userModel.index({ name: 'text' });

module.exports = model('users', userModel);
