const express = require('express');

const router = express.Router();

const Marts = require('../../models/martsModel');
const Users = require('../../models/userModel');

router.post('/adminPlayerId', async (req, res) => {
  try {
    const { userId, playerId } = req.body;

    const admin = await Marts.findById(userId);

    const { playerIds, status } = admin;

    if (status === 'inactive')
      return res.json({
        status: '404',
        msg:
          'Your account has temporarily been blocked. Kindly contact support@dastak.store for more details or contact the following number 03124133513.',
      });

    const isPlayerIdThere = playerIds.some(id => id === playerId);

    if (!isPlayerIdThere) {
      playerIds.push(playerId);
    }

    await admin.save();

    return res.json({
      status: '200',
      data: admin,
    });
  } catch (err) {
    return res.json({
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/userPlayerId', async (req, res) => {
  try {
    const { userId, playerId } = req.body;

    const user = await Users.findById(userId);
    const { status, type } = user;

    if (status === 'inactive')
      return res.json({
        status: '404',
        msg:
          'Your account has temporarily been blocked. Kindly contact support@dastak.store for more details or contact the following number 03124133513.',
      });

    if (type === 'admin') return res.json({ status: '200' });

    if (user.playerId !== playerId && user.playerId !== '')
      return res.json({
        status: '404',
        msg:
          'You have been logged out from this device, because you logged in on another device. If that was not you, please log in again and reset your Password.',
      });

    user.playerId = playerId;
    await user.save();

    return res.json({
      status: '200',
      data: user,
    });
  } catch (err) {
    return res.json({
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/riderPlayerId', async (req, res) => {
  try {
    const { userId, playerId } = req.body;

    const rider = await Users.findById(userId);
    const { status } = rider;

    if (status === 'inactive')
      return res.json({
        status: '404',
        msg:
          'Your account has temporarily been blocked. Kindly contact support@dastak.store for more details or contact the following number 03124133513.',
      });

    if (rider.playerId !== playerId && rider.playerId !== '')
      return res.json({
        status: '404',
        msg:
          'You have been logged out from this device, because you logged in on another device. If that was not you, please log in again and reset your Password',
      });

    rider.playerId = playerId;
    await rider.save();

    return res.json({
      status: '200',
      data: rider,
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
