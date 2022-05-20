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
    verified: Boolean,
    topUp: {
      transactionId: String,
      amount: Number,
      status: String,
    },
    wallet: {
      amount: {
        type: Number,
        default: 0,
      },
      isUsable: {
        type: Boolean,
        default: true,
      },
    },
    superAdminPlayerId: String,
    startShift: String,
    endShift: String,
    adminType: String,
    geometry: GeoSchema,
    easyPaisaPhone: String,
    city: String,
    category: String,
    new: Boolean,
    featured: Boolean,
    rating: Number,
    reviews: Number,
    img: {
      type: Buffer,
    },
    status: {
      type: String,
      default: 'active',
    },
    details: String,
    prepTime: String,
    favouriteRestaurants: Array,
    riderAddress: String,
    employee: Boolean,
    available: Boolean,
    jazzCashNumber: String,
    orderFare: Number,
    dastakDeal: Boolean,
    pickupDeals: Boolean,
    fareType: String,
    altPhone: String,
    name: String,
    phone: String,
    password: String,
    tillNoonFare: Number,
    nightFare: Number,
    lateNightFare: Number,
    cnic: String,
    email: {
      type: String,
      default: '',
    },
    address: Array,
    playerId: String,
    type: {
      type: String,
      default: 'user',
    },
    position: Number,
    orderCount: {
      type: Number,
      default: 0,
    },
    useAsCustomer: {
      type: Boolean,
      default: false,
    },
    pendingCollection: {
      type: Number,
      default: 0,
    },
    unpaidCollection: {
      type: Number,
      default: 0,
    },
    paymentLimit: {
      type: Number,
      default: 4000,
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
    opening: Date,
    closing: Date,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userModel.index({ '$**': 'text' });

module.exports = model('users', userModel);
