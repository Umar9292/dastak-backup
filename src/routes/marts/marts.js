const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../models/userModel');

const router = Router();

router.post('/addMart', async (req, res) => {
  try {
    const params = req.body;

    const query = {
      name: params.name,
      location: params.location,
    };

    const mart = await Users.findOne(query);
    if (mart)
      return res.json({
        status: '404',
        msg: 'This Mart is already registered',
      });

    await new Users(req.body).save();

    return res.json({
      status: '200',
      msg: 'Mart registered',
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

router.get('/allMarts', async (req, res) => {
  try {
    const query = {
      type: 'admin',
      status: 'active',
      available: true,
      shopType: 'mart',
    };

    const allMarts = await Users.find(query)
      .sort({ name: 1 })
      .select('-password -__v');

    return res.json({
      status: '200',
      data: allMarts,
    });
  } catch (err) {
    return res.json({
      status: '404',
      data: 'Looks like an error occurred on our side. Kindly try again',
      error: err.toString(),
    });
  }
});

router.post('/martDetails', async (req, res) => {
  try {
    const { id } = req.body;

    const shop = await Users.findById(id).select('-password -__v');

    return res.json({
      status: '200',
      data: shop,
    });
  } catch (err) {
    return res.json({
      status: '404',
      data: 'Looks like an error occurred on our side. Kindly try again',
      error: err.toString(),
    });
  }
});

/* router.get('/allRestaurants', async (req, res) => {
  try {
    const currentTime = moment().tz('Asia/Karachi');

    console.log(currentTime);

    const query = {
      type: 'admin',
      status: 'active',
      available: true,
      shopType: 'restaurant',
    };

    const allRestaurants = await Users.find(query)
      .sort({ position: -1 })
      .select('-password -__v')
      .lean();

    const result = allRestaurants.filter(restaurant => {
      const restaurantOpening = moment(restaurant.openingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');
      const restaurantClosing = moment(restaurant.closingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');

      if (
        currentTime.isSameOrAfter(restaurantOpening) &&
        currentTime.isBefore(restaurantClosing)
      ) {
        return restaurant;
      }
    });

    return res.json({
      status: '200',
      data: result,
    });
  } catch (err) {
    return res.json({
      status: '404',
      data: 'Looks like an error occurred on our side. Kindly try again',
      error: err.toString(),
    });
  }
}); */

router.get('/allRestaurants', async (req, res) => {
  try {
    const currentTime = moment()
      .tz('Asia/Karachi')
      .toISOString();

    console.log(currentTime);

    const query = {
      type: 'admin',
      status: 'active',
      available: true,
      shopType: 'restaurant',
      opening: { $gte: currentTime },
      closing: { $lt: currentTime },
    };

    const allRestaurants = await Users.find(query)
      .sort({ position: -1 })
      .select('-password -__v')
      .lean();

    return res.json({
      status: '200',
      allRestaurants,
    });
  } catch (err) {
    return res.json({
      status: '404',
      data: 'Looks like an error occurred on our side. Kindly try again',
      error: err.toString(),
    });
  }
});

router.post('/availabilityStatus', async (req, res) => {
  try {
    const { martId } = req.body;

    const shop = await Users.findByIdAndUpdate(
      martId,
      {
        $set: req.body,
      },
      { new: true }
    );

    return res.json({
      status: '200',
      msg: 'Status updated',
      data: shop,
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
