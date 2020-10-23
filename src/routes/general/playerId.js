const express = require('express');

const router = express.Router();

const User = require('../../models/userModel');

router.post('/allotPlayerId', async (req, res) => {
  try {
    const { userId, playerId } = req.body;

    const user = await User.findById(userId);

    if (user.playerId !== playerId && user.playerId !== '')
      return res.json({ status: '404' });

    user.playerId = playerId;
    await user.save();

    return res.json({
      status: '200',
      data: user,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
