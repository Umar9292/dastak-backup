const { Schema, model } = require('mongoose');

const platformFeeModel = Schema(
  {
    platformFee: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model('platform fees', platformFeeModel);
