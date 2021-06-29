const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../models/userModel');

const router = Router();

router.post('/allMedicalStores', async (req, res) => {
  try {
    const { lat, long, employee } = req.body;

    if (employee) {
      const allMedicalStores = await Users.find({
        available: true,
        status: 'active',
        shopType: 'restaurant',
        featured: true,
      });

      return res.json({ status: '200', allMedicalStores });
    }

    const currentTime = moment().tz('Asia/Karachi');

    let [allMedicalStores] = await Promise.all([
      Users.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [long, lat] },
            distanceField: 'dist',
            maxDistance: 2800,
            query: {
              available: true,
              type: 'admin',
              status: 'active',
              shopType: 'store',
            },
            spherical: true,
          },
        },
      ]),
    ]);

    allMedicalStores = allMedicalStores.filter(medicalStore => {
      const restaurantOpening = moment(medicalStore.openingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');
      let restaurantClosing = moment(medicalStore.closingTime, 'HH:mm')
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
        return medicalStore;
      }
    });

    return res.json({
      status: '200',
      allMedicalStores,
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
