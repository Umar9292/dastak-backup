import { Schema, model } from 'mongoose';

const categoriesModel = Schema(
  {
    martId: String,
    categories: Array,
  },
  {
    versionKey: false,
  }
);

export default model('categories', categoriesModel);
