const mongoose = require('mongoose');

const model = mongoose.Schema(
  {
    martId: String,
    offers: Object,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('offers', model);
