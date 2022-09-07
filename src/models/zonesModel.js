const { Schema, model } = require('mongoose');

const zonesModel = Schema(
  {
    city: String,
    zones: Array,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('zones', zonesModel);
