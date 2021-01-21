const { Schema, model } = require('mongoose');

const offersModel = Schema(
  {
    martId: String,
    offers: Object,
  },
  {
    versionKey: false,
  }
);

module.exports = model('offers', offersModel);
