const { Schema, model } = require('mongoose');

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

module.exports = model('flavours and drinks', optionsModel);
