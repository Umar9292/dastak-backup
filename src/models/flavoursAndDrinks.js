import { Schema, model } from 'mongoose';

const optionsModel = Schema(
  {
    martId: String,
    flavours: Object,
    regularFlavours: Object,
    drinks: Object,
  },
  {
    versionKey: false,
  }
);

export default model('flavours and drinks', optionsModel);
