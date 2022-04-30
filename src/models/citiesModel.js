const { Schema, model } = require('mongoose');

const citiesModel = Schema(
  {
    cities: Array,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model('cities', citiesModel);
