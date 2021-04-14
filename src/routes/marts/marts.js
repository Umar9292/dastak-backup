const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../models/userModel');
const Reviews = require('../../models/reviewsModel');
const Orders = require('../../models/ordersModel');

const router = Router();

/* router.get('/allRestaurants', async (req, res) => {
  try {
    const currentTime = moment().tz('Asia/Karachi');

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
      let restaurantClosing = moment(restaurant.closingTime, 'HH:mm')
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

router.post('/allRestaurants', async (req, res) => {
  try {
    const { lat, long } = req.body;

    const currentTime = moment().tz('Asia/Karachi');

    let [data1, data2, allRestaurants] = await Promise.all([
      Users.find({
        available: true,
        status: 'active',
        shopType: 'restaurant',
        featured: true,
      })
        .sort({ name: -1 })
        .lean(),

      Users.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [long, lat] },
            distanceField: 'dist',
            maxDistance: 3100,
            query: {
              available: true,
              type: 'admin',
              status: 'active',
              shopType: 'restaurant',
              category: 'Home Chef',
            },
            spherical: true,
          },
        },
      ]),

      Users.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [long, lat] },
            distanceField: 'dist',
            maxDistance: 3100,
            query: {
              available: true,
              type: 'admin',
              status: 'active',
              shopType: 'restaurant',
            },
            spherical: true,
          },
        },
      ]),
    ]);

    allRestaurants = allRestaurants.filter(restaurant => {
      const restaurantOpening = moment(restaurant.openingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');
      let restaurantClosing = moment(restaurant.closingTime, 'HH:mm')
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
        return restaurant;
      }
    });

    data1 = data1.filter(restaurant => {
      const restaurantOpening = moment(restaurant.openingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');
      let restaurantClosing = moment(restaurant.closingTime, 'HH:mm')
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
        return restaurant;
      }
    });

    data2 = data2.filter(restaurant => {
      const restaurantOpening = moment(restaurant.openingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');
      let restaurantClosing = moment(restaurant.closingTime, 'HH:mm')
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
        return restaurant;
      }
    });

    return res.json({
      status: '200',
      allRestaurants,
      label1: data1.length !== 0 ? 'Featured' : undefined,
      data1: data1.length !== 0 ? data1 : undefined,
      label2: data2.length !== 0 ? 'Home Chefs' : undefined,
      data2: data2.length !== 0 ? data2 : undefined,
    });
  } catch (err) {
    return res.json({
      status: '404',
      data: 'Looks like an error occurred on our side. Kindly try again',
      error: err.toString(),
    });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const { martId, userId } = req.body;
    let eligible = false;

    const [allReviews, orders] = await Promise.all([
      Reviews.findOne({ martId })
        .select('reviews')
        .lean(),

      Orders.countDocuments({ userId, martId }),
    ]);

    if (orders > 0) {
      if (allReviews !== null) {
        const { reviews } = allReviews;

        const allreadyReviewed = reviews.some(
          review => review.userId === userId
        );

        if (allreadyReviewed) {
          eligible = false;
        } else {
          eligible = true;
        }
      } else {
        eligible = true;
      }
    }

    return res.json({
      status: '200',
      allReviews: allReviews === null ? [] : allReviews.reviews,
      eligible,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
      error: err.toString(),
    });
  }
});

router.post('/specificRestaurants', async (req, res) => {
  try {
    const { category } = req.body;
    console.log(req.body);

    const [allRestaurants, featured] = await Promise.all([
      Users.find({
        shopType: 'restaurant',
        status: 'active',
        available: true,
        $text: { $search: category },
      }),

      Users.find({
        shopType: 'restaurant',
        status: 'active',
        available: true,
        featured: true,
      })
        .sort({ name: -1 })
        .lean(),
    ]);

    return res.json({
      status: '200',
      allRestaurants,
      label1: 'Featured',
      data1: featured,
    });
  } catch (err) {
    console.log(err);
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
