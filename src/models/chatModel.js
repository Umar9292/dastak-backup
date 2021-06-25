const { Schema, model } = require('mongoose');

const chatModel = Schema(
  {
    orderId: String,
    userId: String,
    riderId: String,
    chat: Object,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model('chats', chatModel);
