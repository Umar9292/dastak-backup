/* eslint-disable global-require */
require('dotenv').config();
const cluster = require('cluster');
const { connect, connection } = require('mongoose');
const { createServer } = require('http');

const userModel = require('./src/models/userModel');
const Chats = require('./src/models/chatModel');

const { notifyUser } = require('./src/notificationHandler/handler');
const { dbUrl } = require('./utils/dbUrls');

const port = process.env.PORT || 8080;

const app = require('./server');

const server = createServer(app);
// eslint-disable-next-line import/order
const io = require('socket.io')(server);

connect(
  dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log('Connected to database');
    }
  }
);

if (cluster.isMaster) {
  connection.once('open', () => {
    console.log('Setting change streams');
    const ordersChangeStream = connection.collection('orders').watch();
    const chatChangeStream = connection.collection('chats').watch();

    chatChangeStream.on('change', async change => {
      if (change.operationType === 'insert') {
        console.log('insert');
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
        console.log('update');
        const { documentKey, updateDescription } = change;

        const { chat } = updateDescription.updatedFields;

        const fullDcocument = await Chats.findById(documentKey._id).lean();
        const res = io.emit('newMessage', fullDcocument);
        console.log(res);

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

          await notifyUser(msg, '70c3917b-3e8c-4d40-b4b3-65ded06a5534', {
            flag: 'riderMsg',
          });
        } else {
          const { playerId } = await userModel
            .findById(userId)
            .select('playerId')
            .lean();

          await notifyUser(msg, '70c3917b-3e8c-4d40-b4b3-65ded06a5534', {
            flag: 'userMsg',
          });
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

  for (let i = 0; i < 5; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', function(worker) {
    console.log(`worker ${worker.process.pid} died`);
  });
}

if (cluster.isWorker) {
  // eslint-disable-next-line global-require
  require('./server.js');
  server.listen(port, () => console.log(`Listening on port ${port}\n`));
}

module.exports = server;
