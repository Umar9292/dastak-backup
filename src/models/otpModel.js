import { Schema, model } from 'mongoose';

const otpModel = Schema(
  {
    userId: String,
    email: String,
    secret: String,
    token: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default model('otp keys', otpModel);
