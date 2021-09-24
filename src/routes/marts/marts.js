const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../models/userModel');
const Reviews = require('../../models/reviewsModel');
const Orders = require('../../models/ordersModel');

const { getCity } = require('../../geoCoder/getCity');
const { openRestaurants } = require('./openRestaurants/openRestaurants');

const router = Router();

router.post('/allRestaurants', async (req, res) => {
  try {
    let { lat, long, employee, city } = req.body;

    if (city === '') {
      city = await getCity(lat, long);
    }

    if (employee === true) {
      const allRestaurants = await Users.find({
        available: true,
        status: 'active',
        shopType: 'restaurant',
        city,
      }).lean();

      const data1 = allRestaurants.filter(
        ({ featured, city }) => featured && city
      );

      const data2 = allRestaurants.filter(
        ({ category, city }) => category === 'Home Chef' && city
      );

      return res.json({
        status: '200',
        allRestaurants,
        label1: data1.length !== 0 ? 'Featured' : undefined,
        data1: data1.length !== 0 ? data1 : undefined,
        label2: data2.length !== 0 ? 'Home Chefs' : undefined,
        data2: data2.length !== 0 ? data2 : undefined,
      });
    }

    let [data1, data2, allRestaurants] = await Promise.all([
      Users.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [long, lat] },
            distanceField: 'dist',
            maxDistance: city === 'Jhang' ? 5500 : 3500,
            query: {
              available: true,
              status: 'active',
              shopType: 'restaurant',
              featured: true,
            },
            spherical: true,
          },
        },
        { $sort: { position: 1 } },
      ]),

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
            maxDistance: 3500,
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

    [allRestaurants, data1, data2] = await Promise.all([
      openRestaurants(allRestaurants),
      openRestaurants(data1),
      openRestaurants(data2),
    ]);

    return res.json({
      status: '200',
      allRestaurants,
      label1: data1.length !== 0 ? 'Featured' : undefined,
      data1: data1.length !== 0 ? data1 : undefined,
      label2: data2.length !== 0 ? 'Home Chefs' : undefined,
      data2: data2.length !== 0 ? data2 : undefined,
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

router.post('/previousPaymentss', async (req, res) => {
  try {
    const { martId, percentage, startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    let dealPayment = 0;
    let nonDealPayment = 0;
    let ourProfit = 0;

    const orders = await Orders.find({
      martId,
      paid: true,
      status: 'Delivered',
      dateForSearching: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .lean();

    await Promise.all(
      orders.map(async ({ products, orderType }) => {
        await Promise.all(
          products.map(async product => {
            const { net, count } = product;

            if (orderType === 'Delivery' && product.actualPrice === undefined) {
              nonDealPayment += net;
            }

            if (product.actualPrice === undefined && orderType === 'PickUp') {
              const ourPercentage = +((percentage / 100) * net).toFixed();
              ourProfit += ourPercentage;
            }

            if (product.actualPrice !== undefined) {
              const priceDifference = net - product.actualPrice * count;

              if (orderType === 'PickUp') {
                ourProfit += priceDifference;
              } else {
                dealPayment += product.actualPrice * count;
                ourProfit += priceDifference;
              }
            }
          })
        );
      })
    );

    const ourPercentage = +((percentage / 100) * nonDealPayment).toFixed();
    nonDealPayment = nonDealPayment - ourPercentage - ourProfit;

    return res.json({
      status: '200',
      dealPayment,
      nonDealPayment,
      orders,
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

router.post('/rejectedOrders', async (req, res) => {
  try {
    const { martId, startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const rejectedOrders = await Orders.find({
      martId,
      status: 'Rejected',
      dateForSearching: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ status: '200', rejectedOrders });
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
