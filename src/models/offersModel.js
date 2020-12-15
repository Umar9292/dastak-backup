import { Schema, model } from 'mongoose';

const offersModel = Schema(
  {
    martId: String,
    offers: Object,
  },
  {
    versionKey: false,
  }
);

export default model('offers', offersModel);
