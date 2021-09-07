const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../models/userModel');

const router = Router();

router.post('/allStores', async (req, res) => {
  try {
    const { lat, long, employee } = req.body;

    if (employee === true) {
      const allStores = await Users.find({
        available: true,
        type: 'admin',
        status: 'active',
        shopType: { $in: ['store', 'pharmacy'] },
      });

      return res.json({ status: '200', allStores });
    }

    const currentTime = moment().tz('Asia/Karachi');

    let [allStores] = await Promise.all([
      Users.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [long, lat] },
            distanceField: 'dist',
            maxDistance: 3500,
            query: {
              available: true,
              type: 'admin',
              status: 'active',
              shopType: { $in: ['store', 'pharmacy'] },
            },
            spherical: true,
          },
        },
      ]),
    ]);

    allStores = allStores.filter(store => {
      const restaurantOpening = moment(store.openingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');
      let restaurantClosing = moment(store.closingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');

      const openingTimeOffSet = moment(restaurantOpening).format('a');
      const closingTimeOffSet = moment(restaurantClosing).format('a');

      if (
        (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') ||
        (openingTimeOffSet === 'am' && closingTimeOffSet === 'am')
      ) {
        restaurantClosing = moment(restaurantClosing).add(1, 'days');
      }

      if (
        currentTime.isSameOrAfter(restaurantOpening) &&
        currentTime.isBefore(restaurantClosing)
      ) {
        return store;
      }
    });

    return res.json({
      status: '200',
      allStores,
    });
  } catch (err) {
    return res.json({
      status: '404',
      data: 'Looks like an error occurred on our side. Kindly try again',
      error: err.toString(),
    });
  }
});

module.exports = router;
