const Router = require('express/lib/router');

const Users = require('../../models/userModel');
const UniqueUsers = require('../../models/uniqueUsersModel');
const Orders = require('../../models/ordersModel');
const Slider = require('../../models/sliderModel');

const router = Router();

router.post('/superAdminPlayerId', async (req, res) => {
  try {
    const { userId, playerId } = req.body;

    const superAdmin = await Users.findById(userId);
    const { status } = superAdmin;

    if (status === 'inactive') {
      return res.json({
        status: '404',
        msg:
          'Your account has temporarily been blocked. Kindly contact support@dastak.store for more details or contact the following number 03124133513.',
      });
    }

    if (
      superAdmin.superAdminPlayerId !== playerId &&
      superAdmin.superAdminPlayerId !== ''
    ) {
      superAdmin.superAdminPlayerId = '';
      await superAdmin.save();

      return res.json({
        status: '404',
        msg:
          'You have been logged out from this device, because you logged in on another device. If that was not you, please log in again and reset your Password',
      });
    }

    superAdmin.superAdminPlayerId = playerId;
    await superAdmin.save();

    return res.json({
      status: '200',
      data: superAdmin,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/adminPlayerId', async (req, res) => {
  try {
    const { userId, playerId } = req.body;

    const admin = await Users.findById(userId);

    const { playerIds, status } = admin;

    if (status === 'inactive') {
      return res.json({
        status: '404',
        msg:
          'Your account has temporarily been blocked. Kindly contact support@dastak.store for more details or contact the following number 03124133513.',
      });
    }

    const isPlayerIdThere = playerIds.some(id => id === playerId);

    if (!isPlayerIdThere) {
      playerIds.push(playerId);
      await admin.save();
    }

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
    const { type, status } = user;

    if (status === 'inactive') {
      return res.json({
        status: '404',
        msg:
          'Your account has temporarily been blocked. Kindly contact support@dastak.store for more details.',
      });
    }

    const orders = await Orders.find({
      userId: user._id,
      orderType: 'Delivery',
      $and: [{ status: { $ne: 'Delivered' } }, { status: { $ne: 'Rejected' } }],
    });

    if (type === 'admin') {
      return res.json({ status: '200', data: user, orders });
    }

    if (user.playerId !== playerId && user.playerId) {
      return res.json({
        status: '404',
        msg:
          'You have been logged out from this device, because you logged in on another device. If that was not you, please log in again and reset your Password.',
      });
    }

    let slides = [];
    if (user.city !== undefined) {
      const { slides: cityDeals } = await Slider.findOne({ city: user.city })
        .select('slides')
        .lean();

      slides = cityDeals;
    }

    user.playerId = playerId;
    await user.save();

    res.json({
      status: '200',
      data: user,
      showSlides: true,
      slides,
      orders,
    });

    const unique = await UniqueUsers.findOne();
    if (!unique.users.includes(user._id)) {
      unique.users.push(user._id);
      unique.userCount += 1;
      return unique.save();
    }
  } catch (err) {
    console.log(err);
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
