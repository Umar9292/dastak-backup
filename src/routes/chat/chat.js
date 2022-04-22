const Router = require('express/lib/router');
// const io = require('../../../server');

const Chats = require('../../models/chatModel');
const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');

const { emitMessage } = require('../../../server');
const {
  notifyUser,
  notifyRiders,
} = require('../../notificationHandler/handler');

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

    const msg = `New message from ${chat[0].type}: ${chat[0].txt}`;

    if (chat[0].type === 'user') {
      const { playerId, name } = await Users.findById(riderId)
        .select('playerId name')
        .lean();

      await notifyRiders(name, msg, playerId, {
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
