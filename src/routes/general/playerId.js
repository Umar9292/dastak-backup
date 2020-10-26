const express = require('express');

const router = express.Router();

const Marts = require('../../models/martsModel');
const Users = require('../../models/userModel');

router.post('/allotPlayerId', async (req, res) => {
  try {
    const { userId, playerId } = req.body;

    const user = await Users.findById(userId);

    if (user.type === 'admin') {
      const admin = await Marts.findById(userId);

      const { playerIds } = admin;

      const isPlayerIdThere = playerIds.some(id => id === playerId);

      if (!isPlayerIdThere) {
        playerIds.push(playerId);
      }

      await admin.save();

      return res.json({
        status: '200',
        data: admin,
      });
    }

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
