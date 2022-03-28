const Router = require('express/lib/router');

const Users = require('../../models/userModel');

const {
  calculateDeliveryCharges,
} = require('../../calculateDeliveryCharges/calculateDeliveryCharges');

const router = Router();

router.post('/calculateDeliveryCharges', async (req, res) => {
  try {
    const {
      martId,
      userId,
      martLatitude,
      martLongitude,
      userLatitude,
      userLongitude,
    } = req.body;

    const [restaurant, user, deliveryCharges] = await Promise.all([
      Users.findById(martId)
        .select('-password -__v')
        .lean(),

      Users.findById(userId)
        .select('-password -__v')
        .lean(),

      calculateDeliveryCharges(
        userLatitude,
        userLongitude,
        martLatitude,
        martLongitude
      ),
    ]);

    restaurant.deliveryCharges = deliveryCharges;
    restaurant.password = null;

    return res.json({
      status: '200',
      restaurant,
      user,
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
