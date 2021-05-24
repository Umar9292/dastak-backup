const Router = require('express/lib/router');

const Chats = require('../../models/chatModel');

const router = Router();

router.post('/newMessage', async (req, res) => {
  try {
    const { orderId, chat } = req.body;

    const chatFound = await Chats.findOne({ orderId });
    if (!chatFound) {
      await new Chats(req.body).save();
    }

    await Chats.findOneAndUpdate({ orderId }, { chat });

    res.json({ status: '200' });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
