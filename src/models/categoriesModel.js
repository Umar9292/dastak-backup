const mongoose = require('mongoose');

const model = mongoose.Schema(
  {
    martId: String,
    categories: Array,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('categories', model);
