const Router = require('express/lib/router');
// const io = require('../../../server');

const Chats = require('../../models/chatModel');
const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');

const { notifyUser } = require('../../notificationHandler/handler');
const { emitMessage } = require('../../../server');

const router = Router();

router.post('/newMessage', async (req, res) => {
  try {
    const { orderId, riderId, userId, chat } = req.body;

    const { status } = await Orders.findById(orderId)
      .select('status')
      .lean();
    if (status === 'Delivered' || status === 'Rejected') {
      return res.json({ status: '404' });
    }

    let updatedChat;
    const chatFound = await Chats.findOne({ orderId });
    if (!chatFound) {
      updatedChat = await new Chats(req.body).save();
    } else {
      updatedChat = await Chats.findOneAndUpdate(
        { orderId },
        { chat },
        { new: true }
      );
    }

    emitMessage(updatedChat);

    res.json({ status: '200' });

    const msg = `New message from ${chat[chat.length - 1].type}: ${
      chat[chat.length - 1].txt
    }`;

    if (chat[chat.length - 1].type === 'user') {
      const { playerId } = await Users.findById(riderId)
        .select('playerId')
        .lean();

      await notifyUser(msg, playerId, {
        flag: 'riderMsg',
      });
    } else {
      const { playerId } = await Users.findById(userId)
        .select('playerId')
        .lean();

      await notifyUser(msg, playerId, {
        flag: 'userMsg',
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/allMessages', async (req, res) => {
  try {
    const { orderId } = req.body;

    const { chat } = await Chats.findOne({ orderId })
      .select('chat')
      .lean();

    if (!chat) {
      return res.json({ status: '404' });
    }

    res.json({ status: '200', chat });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
