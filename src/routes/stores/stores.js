const Router = require('express/lib/router');

const Users = require('../../models/userModel');

// const { getCity } = require('../../geoCoder/getCity');
const {
  openRestaurants,
} = require('../../routes/marts/openRestaurants/openRestaurants');

const router = Router();

router.post('/v1/allStores', async (req, res) => {
  try {
    const { lat, long, employee } = req.body;

    /* if (employee === true) {
      if (city === '') {
        city = await getCity(lat, long);
      }

      const allStores = await Users.find({
        available: true,
        type: 'admin',
        status: 'active',
        city,
        shopType: { $in: ['store', 'pharmacy'] },
      });

      return res.json({ status: '200', allStores });
    } */

    let allStores = await Users.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [long, lat] },
          distanceField: 'dist',
          maxDistance: employee === true ? 20000 : 6000,
          query: {
            available: true,
            type: 'admin',
            status: 'active',
            shopType: 'store',
          },
          spherical: true,
        },
      },
    ]);

    allStores = await openRestaurants(lat, long, allStores);

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
