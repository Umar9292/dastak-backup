const mongoose = require('mongoose');

const model = mongoose.Schema(
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

module.exports = mongoose.model('flavours and drinks', model);
