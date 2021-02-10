const Router = require('express/lib/router');

const Users = require('../../../models/userModel');

const router = Router();

router.get('/manageRestaurants', async (_req, res) => {
  try {
    const [activeRestaurants, inactiveRestaurants] = await Promise.all([
      Users.find({
        type: 'admin',
        shopType: 'restaurant',
        status: 'active',
      })
        .sort({ name: 1 })
        .lean(),

      Users.find({
        type: 'admin',
        shopType: 'restaurant',
        status: 'inactive',
      })
        .sort({ name: 1 })
        .lean(),
    ]);

    return res.json({ status: '200', activeRestaurants, inactiveRestaurants });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
