const Router = require('express/lib/router');

const Users = require('../../models/userModel');
const FaresModel = require('../../models/faresModel');

const { getAddress } = require('../../geoCoder/getAddress');
const {
  calculateDeliveryCharges,
} = require('../../calculateDeliveryCharges/calculateDeliveryCharges');

const router = Router();

router.post('/calculateDeliveryCharges', async (req, res) => {
  try {
    const {
      martId,
      userId,
      city,
      martLatitude,
      martLongitude,
      userLatitude,
      userLongitude,
    } = req.body;

    const [restaurant, user, { platformFee }] = await Promise.all([
      Users.findById(martId)
        .select('-password -__v')
        .lean(),

      Users.findById(userId)
        .select('-password -__v')
        .lean(),

      FaresModel.findOne({ city })
        .select('platformFee')
        .lean(),
    ]);

    const deliveryCharges = await calculateDeliveryCharges(
      restaurant.city,
      userLatitude,
      userLongitude,
      martLatitude,
      martLongitude
    );

    restaurant.deliveryCharges = deliveryCharges;
    restaurant.password = null;

    let { address } = req.body;
    if (address === 'Current Location') {
      address = await getAddress(userLatitude, userLongitude);
    }

    if (userId !== undefined) {
      return res.json({
        status: '200',
        card: true,
        platformFee,
        restaurant,
        address,
        user,
      });
    }

    return res.json({
      status: '202',
      card: true,
      platformFee,
      restaurant,
      address,
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

module.exports = router;
