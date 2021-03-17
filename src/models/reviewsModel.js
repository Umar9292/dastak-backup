const { Schema, model } = require('mongoose');

const reviewsModel = Schema(
  {
    martId: String,
    reviews: Array,
  },
  {
    versionKey: false,
  }
);

module.exports = model('reviews', reviewsModel);
