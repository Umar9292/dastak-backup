const { Schema, model } = require('mongoose');

const categoriesModel = Schema(
  {
    martId: String,
    categories: Array,
  },
  {
    versionKey: false,
  }
);

module.exports = model('categories', categoriesModel);
