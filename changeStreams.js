const { connection } = require('mongoose');

const { io } = require('./server');
const { notifyUser } = require('./src/notificationHandler/handler');

const userModel = require('./src/models/userModel');
const Chats = require('./src/models/chatModel');

exports.startChangeStreams = () => {
  connection.once('open', () => {
    console.log('Setting change streams');
    const ordersChangeStream = connection.collection('orders').watch();
    const chatChangeStream = connection.collection('chats').watch();

    chatChangeStream.on('change', async change => {
      if (change.operationType === 'insert') {
        const { fullDocument } = change;

        io.emit('newMessage', fullDocument);

        const { chat, userId, riderId } = fullDocument;
        const msg = `New message from ${chat[0].type}: ${chat[0].txt}`;

        if (chat[0].type === 'user') {
          const { playerId } = await userModel
            .findById(riderId)
            .select('playerId')
            .lean();

          await notifyUser(msg, playerId, { flag: 'riderMsg' });
        } else {
          const { playerId } = await userModel
            .findById(userId)
            .select('playerId')
            .lean();

          await notifyUser(msg, playerId, { flag: 'userMsg' });
        }
      }

      if (change.operationType === 'update') {
        const { documentKey, updateDescription } = change;

        const { chat } = updateDescription.updatedFields;

        const fullDcocument = await Chats.findById(documentKey._id).lean();
        io.emit('newMessage', fullDcocument);

        const msg = `New message from ${chat[0].type}: ${
          chat[chat.length - 1].txt
        }`;

        const { userId, riderId } = await Chats.findById(documentKey._id)
          .select('userId riderId')
          .lean();

        if (chat[chat.length - 1].type === 'user') {
          const { playerId } = await userModel
            .findById(riderId)
            .select('playerId')
            .lean();

          await notifyUser(msg, playerId, { flag: 'riderMsg' });
        } else {
          const { playerId } = await userModel
            .findById(userId)
            .select('playerId')
            .lean();

          await notifyUser(msg, playerId, { flag: 'userMsg' });
        }
      }
    });

    ordersChangeStream.on('change', async change => {
      if (
        change.operationType === 'update' &&
        change.updateDescription.updatedFields.orderTotal !== undefined
      ) {
        const { documentKey, updateDescription } = change;
        const msg = `Order total of order id ${documentKey._id} got changed to ${updateDescription.updatedFields.orderTotal}`;
        console.log('Here is the problem\n');
        await notifyUser(msg, '70c3917b-3e8c-4d40-b4b3-65ded06a5534', {});
      }
    });
  });
};
