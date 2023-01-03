const { Schema, model } = require('mongoose');

const sliderModel = Schema(
  {
    slides: [
      {
        img: String,
        key: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model('slides', sliderModel);
