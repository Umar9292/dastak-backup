const Router = require('express/lib/router');
const moment = require('moment-timezone/moment-timezone');
const axios = require('axios');
const { createClient } = require('redis');

const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const StoreProducts = require('../../models/storeProducts');
const Flavours = require('../../models/flavoursAndDrinks');
const Categories = require('../../models/categoriesModel');

const client = createClient(process.env.REDIS_URL);

const router = Router();

/* router.post('/allProducts', async (req, res) => {
  try {
    const { martId, userId } = req.body;
    let finalData = [];

    const [{ categories }, { shopType, name }, options] = await Promise.all([
      Categories.findOne({ martId }),
      Users.findById(martId),
      Flavours.findOne({ martId }),
    ]);

    if (userId && userId !== '') {
      const customer = await Users.findById(userId).select('name');
      console.log(`${customer.name} opened ${name}`);
    } else {
      console.log(`${name} has been opened`);
    }

    if (shopType === 'restaurant') {
      for (const category of categories) {
        const query = {
          category,
          martId,
          available: 'in stock',
        };

        const products = await Products.find(query).sort({ productName: 1 });

        const filteredProducts = products.filter(
          ({ type, drinks }) => type === 'deal' || drinks === true
        );

        if (filteredProducts.length > 0) {
          for (const product of filteredProducts) {
            const { type, regular, drinks } = product;

            if (
              (type === 'deal' && !regular) ||
              (type === 'deal' && regular === undefined)
            ) {
              product.flavours = options.flavours;
            }

            if (type === 'deal' && regular) {
              product.flavours = options.regularFlavours;
            }

            if (drinks === true) {
              product.allDrinks = options.drinks;
            }
          }
        }

        const data = {
          category: query.category,
          data: products,
        };

        finalData = [...finalData, data];
      }

      return res.json({
        status: '200',
        data: finalData,
      });
    }

    await Promise.all(
      categories.map(async ac => {
        const query = {
          category: ac,
          martId,
          available: 'in stock',
        };

        const martProducts = await Products.find(query).sort({
          productName: 1,
        });

        const data = {
          category: ac,
          data: martProducts,
        };

        await Promise.resolve(data);
        finalData.push(data);
      })
    );

    finalData = orderBy(finalData, ['category'], ['asc']);

    return res.json({
      status: '200',
      data: finalData,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

router.post('/allProducts', async (req, res) => {
  try {
    const {
      martId,
      userId,
      userLatitude,
      userLongitude,
      martLatitude,
      martLongitude,
    } = req.body;

    console.log(req.body);

    let finalData = [];

    client.get(martId, async (err, data) => {
      if (err) console.log(err);

      const restaurant = await Users.findById(martId).lean();

      const { data: distanceData } = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${+userLatitude},${+userLongitude}&destinations=${+martLatitude},${+martLongitude}&key=${
          process.env.GOOGLE_API_KEY
        }`
      );

      const distance = distanceData.rows[0].elements[0].distance.text.substring(
        0,
        3
      );

      let deliveryCharges = 0;

      if (+distance <= 1) {
        deliveryCharges = 20;
      }

      if (+distance > 1 && +distance <= 2) {
        deliveryCharges = 30;
      }

      if (+distance > 2 && +distance <= 4) {
        deliveryCharges = 40;
      }

      if (+distance > 4) {
        deliveryCharges = 50;
      }

      restaurant.deliveryCharges = deliveryCharges;

      if (data !== null) {
        return res.json({ status: '200', data: JSON.parse(data), restaurant });
      }

      const [{ categories }, { name }, options] = await Promise.all([
        Categories.findOne({ martId })
          .select('categories')
          .lean(),

        Users.findById(martId)
          .select('name')
          .lean(),

        Flavours.findOne({ martId }).lean(),
      ]);

      if (userId && userId !== '') {
        const customer = await Users.findById(userId).select('name');
        console.log(`${customer.name} opened ${name}`);
      } else {
        console.log(`${name} has been opened`);
      }

      for (const category of categories) {
        const query = {
          category,
          martId,
          available: 'in stock',
        };

        const products = await Products.find(query).sort({
          dealNumber: 1,
          productName: 1,
          quantity: -1,
        });

        if (products.length > 0) {
          const filteredProducts = products.filter(
            ({ type, drinks }) => type === 'deal' || drinks === true
          );

          if (filteredProducts.length > 0) {
            for (const product of filteredProducts) {
              const { type, regular, drinks } = product;

              if (product.dealFlavours) {
                product.flavours = options.dealFlavours;
              } else {
                if (
                  (type === 'deal' && !regular) ||
                  (type === 'deal' && regular === undefined)
                ) {
                  product.flavours = options.flavours;
                }

                if (type === 'deal' && regular) {
                  product.flavours = options.regularFlavours;
                }
              }

              if (drinks === true) {
                product.allDrinks = options.drinks;
              }
            }
          }

          const data = {
            category: query.category,
            data: products,
          };

          finalData = [...finalData, data];
        }
      }

      res.json({
        status: '200',
        data: finalData,
        restaurant,
      });

      client.setex(martId, 600, JSON.stringify(finalData));
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/allRestaurantProducts', async (req, res) => {
  try {
    const { martId } = req.body;

    const { categories } = await Categories.findOne({ martId });

    const finalData = await Promise.all(
      categories.map(async category => {
        const query = {
          category,
          martId,
        };

        const products = await Products.find(query).sort({ productName: 1 });

        const data = {
          category,
          data: products,
        };

        return data;
      })
    );

    return res.json({
      status: '200',
      data: finalData,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/allCategories', async (req, res) => {
  try {
    const { martId } = req.body;

    const { categories } = await Categories.findOne({ martId });

    return res.json({
      status: '200',
      data: categories,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/productAvailability', async (req, res) => {
  try {
    const { productId, shopType } = req.body;

    if (shopType && shopType === 'store') {
      await StoreProducts.findByIdAndUpdate(productId, { $set: req.body });
    }
    await Products.findByIdAndUpdate(productId, { $set: req.body });

    return res.json({
      status: '200',
      msg: 'Product status updated',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/addAvailability', async (req, res) => {
  try {
    await Products.updateMany({}, { available: 'in stock' });

    return res.json({
      status: '200',
      msg: 'Products updated',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/updateProductsAvailability', async (req, res) => {
  try {
    const { category, martId } = req.body;

    const query = {
      category,
      martId,
    };

    await Products.updateMany(query, { $set: req.body });

    return res.json({
      status: '200',
      msg: 'Status successfully updated',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

/* router.get('/dastakDeals', async (_req, res) => {
  try {
    const currentTime = moment().tz('Asia/karachi');

    const restaurants = await Users.find({
      shopType: 'restaurant',
      available: true,
      dastakDeal: true,
    });

    const openRestaurants = await Promise.all(
      restaurants.map(restaurant => {
        let { openingTime: opening, closingTime: closing, _id } = restaurant;

        [opening, closing] = [
          moment(opening, 'HH:mm:ssa').tz('Asia/Karachi'),
          moment(closing, 'HH:mm:ssa').tz('Asia/Karachi'),
        ];

        let [openingTime, closingTime, openingOffSet, closingOffSet] = [
          moment(opening).subtract(5, 'hours'),
          moment(closing).subtract(5, 'hours'),
          moment(opening).format('a'),
          moment(closing).format('a'),
        ];

        if (
          (openingOffSet === 'pm' && closingOffSet === 'am') ||
          (openingTime === 'am' && closingOffSet === 'am')
        ) {
          closingTime = moment(closingTime).add(1, 'days');
        }

        if (currentTime.isBetween(openingTime, closingTime)) {
          return _id;
        }
      })
    );

    let dastakDeals = [];

    await Promise.all(
      openRestaurants.map(async martId => {
        const [restaurant, products, options] = await Promise.all([
          Users.findById(martId),

          Products.find({
            martId,
            dastakDeal: true,
            available: 'in stock',
          }),

          Flavours.findOne({ martId }),
        ]);

        if (products.length > 0) {
          for (const product of products) {
            const { regular, drinks, type } = product;

            if (
              (type === 'deal' && !regular) ||
              (type === 'deal' && regular === undefined)
            ) {
              product.flavours = options.flavours;
            }

            if (type === 'deal' && regular === true) {
              product.flavours = options.regularFlavours;
            }

            if (drinks === true) {
              product.allDrinks = options.drinks;
            }

            product.restaurant = restaurant;
            dastakDeals = [...dastakDeals, product];
          }
        }
      })
    );

    return res.json({
      status: '200',
      data: dastakDeals,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

router.post('/dastakDeals', async (req, res) => {
  try {
    const { lat, long, employee } = req.body;

    const currentTime = moment().tz('Asia/Karachi');

    let restaurants = [];

    if (!employee) {
      restaurants = await Users.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [long, lat] },
            distanceField: 'dist',
            maxDistance: 3500,
            query: {
              available: true,
              dastakDeal: true,
              type: 'admin',
              status: 'active',
              shopType: 'restaurant',
            },
            spherical: true,
          },
        },
      ]);
    } else {
      restaurants = await Users.find({
        available: true,
        dastakDeal: true,
        type: 'admin',
        status: 'active',
        shopType: 'restaurant',
      });
    }

    const openRestaurants = [];

    restaurants.filter(restaurant => {
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
        openRestaurants.push(restaurant._id);
      }
    });

    let dastakDeals = [];

    await Promise.all(
      openRestaurants.map(async martId => {
        const [restaurant, products, options] = await Promise.all([
          Users.findById(martId),

          Products.find({
            martId,
            dastakDeal: true,
            available: 'in stock',
          }),

          Flavours.findOne({ martId }),
        ]);

        if (products.length > 0) {
          for (const product of products) {
            const { regular, drinks, type } = product;

            if (
              (type === 'deal' && !regular) ||
              (type === 'deal' && regular === undefined)
            ) {
              product.flavours = options.flavours;
            }

            if (type === 'deal' && regular === true) {
              product.flavours = options.regularFlavours;
            }

            if (drinks === true) {
              product.allDrinks = options.drinks;
            }

            product.restaurant = restaurant;
            dastakDeals = [...dastakDeals, product];
          }
        }
      })
    );

    return res.json({
      status: '200',
      data: dastakDeals,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
