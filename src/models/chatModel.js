const { Schema, model } = require('mongoose');

const chatModel = Schema(
  {
    orderId: String,
    userId: String,
    riderId: String,
    chat: Object,
  },
  {
    versionKey: false,
  }
);

module.exports = model('chats', chatModel);
