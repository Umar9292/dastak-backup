const { Schema, model } = require('mongoose');

const submissionsModel = Schema(
  {
    riderId: String,
    riderName: String,
    submissions: Array,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model('payment submissions', submissionsModel);
