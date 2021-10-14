const Router = require('express/lib/router');
const { createClient } = require('redis');

const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const StoreProducts = require('../../models/storeProducts');
const Flavours = require('../../models/flavoursAndDrinks');
const Categories = require('../../models/categoriesModel');

const { getCity } = require('../../geoCoder/getCity');
const {
  openRestaurants: checkOpenRestaurants,
} = require('../../routes/marts/openRestaurants/openRestaurants');
const {
  calculateDeliveryCharges,
} = require('../../calculateDeliveryCharges/calculateDeliveryCharges');

const client = createClient(process.env.REDIS_URL);

const router = Router();

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

    let finalData = [];

    client.get(martId, async (err, data) => {
      if (err) console.log(err);

      if (data !== null) {
        finalData = JSON.parse(data);
      }

      const [restaurant, deliveryCharges] = await Promise.all([
        Users.findById(martId).lean(),

        calculateDeliveryCharges(
          userLatitude,
          userLongitude,
          martLatitude,
          martLongitude
        ),
      ]);

      restaurant.deliveryCharges = deliveryCharges;

      if (data !== null) {
        return res.json({ status: '200', data: finalData, restaurant });
      }

      const [{ categories }, options] = await Promise.all([
        Categories.findOne({ martId })
          .select('categories')
          .lean(),

        Flavours.findOne({ martId }).lean(),
      ]);

      const { name } = restaurant;
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

router.post('/dastakDeals', async (req, res) => {
  try {
    let { lat, long, employee, city } = req.body;

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
      if (city === '') {
        city = await getCity(lat, long);
      }

      restaurants = await Users.find({
        available: true,
        dastakDeal: true,
        type: 'admin',
        status: 'active',
        shopType: 'restaurant',
        city,
      });
    }

    const openRestaurants = await checkOpenRestaurants(restaurants);

    let dastakDeals = [];

    await Promise.all(
      openRestaurants.map(async ({ _id: martId }) => {
        const [restaurant, products, options] = await Promise.all([
          Users.findById(martId),

          Products.find({
            martId,
            dastakDeal: true,
            available: 'in stock',
          }),

          Flavours.findOne({ martId }),
        ]);

        const [longitude, latitude] = restaurant.geometry.coordinates;
        const deliveryCharges = await calculateDeliveryCharges(
          lat,
          long,
          latitude,
          longitude
        );

        restaurant.deliveryCharges = deliveryCharges;

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
