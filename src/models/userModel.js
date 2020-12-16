import { Schema, model } from 'mongoose';

const userModel = Schema(
  {
    status: {
      type: String,
      default: 'active',
    },
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

export default model('users', userModel);
