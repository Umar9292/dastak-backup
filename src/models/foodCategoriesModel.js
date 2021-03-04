const { Schema, model } = require('mongoose');

const categoriesModel = Schema(
  {
    categories: Array,
  },
  {
    versionKey: false,
  }
);

module.exports = model('food categories', categoriesModel);
