import { Schema, model } from 'mongoose';

const ridersModel = Schema(
  {
    status: String,
    available: {
      type: Boolean,
      default: true,
    },
    name: String,
    phone: String,
    password: String,
    address: String,
    playerId: String,
    type: {
      type: String,
      default: 'rider',
    },
    cnic: String,
    orderCount: Number,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default model('user', ridersModel);
