import { Schema, model } from 'mongoose';

const martsModel = Schema(
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
    email: String,
    img: String,
    logo: String,
    name: String,
    phone: String,
    password: String,
    address: {
      type: Object,
      default: [],
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
    type: {
      type: String,
      default: 'admin',
    },
    latitude: String,
    longitude: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default model('user', martsModel);
