const Router = require('express/lib/router');
const moment = require('moment-timezone');
const { createClient } = require('redis');

const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const Orders = require('../../models/ordersModel');
const StoreProducts = require('../../models/storeProducts');
const Flavours = require('../../models/flavoursAndDrinks');
const Categories = require('../../models/categoriesModel');

// const { getCity } = require('../../geoCoder/getCity');
const { notifyUser } = require('../../notificationHandler/handler');
const {
  openRestaurants: checkOpenRestaurants,
} = require('../../routes/marts/openRestaurants/openRestaurants');
const {
  openRestaurantsForPickup,
} = require('../../routes/marts/openRestaurants/openRestaurantsForPickup');

const client = createClient(process.env.REDIS_URL, {
  tls: { rejectUnauthorized: false },
});
// const client = createClient(process.env.REDIS_URL);

const router = Router();

/* router.post('/allProducts', async (req, res) => {
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

        const products = await Products.find(query).sort({ price: 1 });

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
}); */

router.post('/allProducts', async (req, res) => {
  try {
    const { martId, userId } = req.body;

    let finalData = [];
    let maxLimitProduct = false;

    client.get(martId, async (err, data) => {
      if (err) console.log(err);

      if (data !== null) {
        finalData = JSON.parse(data);
      }

      if (data !== null) {
        return res.json({ status: '200', data: finalData });
      }

      const [{ categories }, options] = await Promise.all([
        Categories.findOne({ martId })
          .select('categories')
          .lean(),

        Flavours.findOne({ martId }).lean(),
      ]);

      const currentTime = moment().tz('Asia/Karachi');
      let filteredCategories = [];

      await Promise.all(
        categories.map(category => {
          let { startTime, endTime, name } = category;

          if (startTime !== '') {
            startTime = moment(startTime, 'HH:mm')
              .tz('Asia/Karachi')
              .subtract(5, 'hours');
            endTime = moment(endTime, 'HH:mm')
              .tz('Asia/Karachi')
              .subtract(5, 'hours');

            const openingTimeOffSet = moment(startTime).format('a');
            const closingTimeOffSet = moment(endTime).format('a');

            if (
              (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') ||
              (openingTimeOffSet === 'am' && closingTimeOffSet === 'am')
            ) {
              endTime = moment(endTime).add(1, 'days');
            }

            if (
              currentTime.isSameOrAfter(startTime.toISOString()) &&
              currentTime.isBefore(endTime.toISOString())
            ) {
              filteredCategories = [...filteredCategories, name];
            }
          } else {
            filteredCategories = [...filteredCategories, name];
          }
        })
      );

      for (const category of filteredCategories) {
        const query = {
          category,
          martId,
          available: 'in stock',
        };

        const products = await Products.find(query).sort({ price: 1 });

        if (products.length > 0) {
          const filteredProducts = products.filter(
            ({ type }) => type === 'deal'
          );

          const maxCountProducts = products.filter(
            product => product.maxCount !== undefined
          );

          if (userId !== '' && maxCountProducts.length > 0) {
            maxLimitProduct = true;

            const date = moment()
              .tz('Asia/Karachi')
              .format('DD-MM-YYYY');

            const dealOrders = await Orders.find({
              status: { $ne: 'Rejected' },
              userId,
              martId,
              date,
              dealCount: { $gt: 0 },
            })
              .select('dealCount')
              .lean();

            if (dealOrders.length > 0) {
              const dealCount = dealOrders.reduce((a, b) => a + b.dealCount, 0);

              for (const product of maxCountProducts) {
                product.maxCount -= dealCount;
              }
            }
          }

          if (filteredProducts.length > 0) {
            const { specifications: flavourSpecifications } = options;

            for (const product of filteredProducts) {
              const details = [];

              const { specifications } = product;

              await Promise.all(
                specifications.map(
                  ({ productName, productType, flavourType }) => {
                    flavourSpecifications.map(specification => {
                      if (
                        productType === specification.productType &&
                        flavourType === specification.flavourType
                      ) {
                        details.push({
                          title: productName,
                          data: specification.data,
                        });
                      }
                    });
                  }
                )
              );

              product.specifications = details;
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
      });

      if (maxLimitProduct) {
        client.setex(martId, 600, JSON.stringify(finalData));
      }
    });
  } catch (err) {
    console.log(err);
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
        const { name } = category;
        const query = {
          category: name,
          martId,
        };

        const products = await Products.find(query).sort({ productName: 1 });

        const data = {
          category: name,
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

router.post('/updateSingleProduct', async (req, res) => {
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

router.post('/editProduct', async (req, res) => {
  try {
    const { productId } = req.body;

    const { martId, category, productName } = await Products.findByIdAndUpdate(
      productId,
      {
        $set: req.body,
      }
    );

    res.json({
      status: '200',
      msg: 'Product updated',
    });

    const { name } = await Users.findById(martId).select('name');
    const msg = `${name} updated a product of ${category} category where product name = ${productName}`;
    await notifyUser(msg, 'ac6d647f-e496-408c-bc3b-6cb442578258', {});
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

router.post('/updateAllProducts', async (req, res) => {
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

/* router.post('/dastakDeals', async (req, res) => {
  try {
    const { lat, long, employee } = req.body;

    let restaurants = [];

    restaurants = await Users.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [long, lat] },
          distanceField: 'dist',
          maxDistance: employee === true ? 20000 : 3000,
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

        restaurant.deliveryCharges = '40';

        if (products.length > 0) {
          for (const product of products) {
            const { regular, drinks, type } = product;

            if (product.dealFlavours) {
              product.flavours = options.dealFlavours;
            } else {
              if (
                (type === 'deal' && !regular) ||
                (type === 'deal' && regular === undefined)
              ) {
                product.flavours = options.flavours;
              }

              if (type === 'deal' && regular === true) {
                product.flavours = options.regularFlavours;
              }
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
}); */

router.post('/pickupDeals', async (req, res) => {
  try {
    const { lat, long, userId } = req.body;

    let restaurants = [];

    restaurants = await Users.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [long, lat] },
          distanceField: 'dist',
          maxDistance: 6000,
          query: {
            available: true,
            pickupDeals: true,
            type: 'admin',
            status: 'active',
            shopType: 'restaurant',
          },
          spherical: true,
        },
      },
    ]);

    let pickupDeals = [];
    let maxCountProducts;

    if (restaurants.length > 0) {
      const openRestaurants = await openRestaurantsForPickup(restaurants);

      const currentTime = moment().tz('Asia/Karachi');

      await Promise.all(
        openRestaurants.map(async ({ _id: martId }) => {
          const [restaurant, products] = await Promise.all([
            Users.findById(martId),

            Products.find({
              martId,
              pickupDeal: true,
              available: 'in stock',
            }).sort({ price: 1 }),
          ]);

          const availableProducts = products.filter(product => {
            const productOpening = moment(product.startTime, 'HH:mm')
              .tz('Asia/Karachi')
              .subtract(5, 'hours');
            let productClosing = moment(product.endTime, 'HH:mm')
              .tz('Asia/Karachi')
              .subtract(5, 'hours');

            const openingTimeOffSet = moment(productOpening).format('a');
            const closingTimeOffSet = moment(productClosing).format('a');

            if (
              (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') ||
              (openingTimeOffSet === 'am' && closingTimeOffSet === 'am')
            ) {
              productClosing = moment(productClosing).add(1, 'days');
            }

            if (
              currentTime.isSameOrAfter(productOpening) &&
              currentTime.isBefore(productClosing)
            ) {
              return product;
            }
          });

          if (availableProducts.length > 0) {
            const details = [];

            maxCountProducts = availableProducts.filter(
              product => product.maxCount !== undefined
            );

            if (userId !== '' && maxCountProducts.length > 0) {
              const date = moment()
                .tz('Asia/Karachi')
                .format('DD-MM-YYYY');

              const dealOrders = await Orders.find({
                status: { $ne: 'Rejected' },
                userId,
                martId,
                date,
                dealCount: { $gt: 0 },
              })
                .select('dealCount')
                .lean();

              if (dealOrders.length > 0) {
                const dealCount = dealOrders.reduce(
                  (a, b) => a + b.dealCount,
                  0
                );

                for (const product of maxCountProducts) {
                  product.maxCount -= dealCount;
                }
              }
            }

            for (const product of availableProducts) {
              product.restaurant = restaurant;

              if (product.type === 'deal') {
                const options = await Flavours.findOne({ martId });
                const { specifications: flavourSpecifications } = options;
                const { specifications } = product;

                await Promise.all(
                  specifications.map(
                    ({ productName, productType, flavourType }) => {
                      flavourSpecifications.map(specification => {
                        if (
                          productType === specification.productType &&
                          flavourType === specification.flavourType
                        ) {
                          details.push({
                            title: productName,
                            data: specification.data,
                          });
                        }
                      });
                    }
                  )
                );

                product.specifications = details;
              }

              pickupDeals = [...pickupDeals, product];
            }
          }
        })
      );
    }

    return res.json({
      status: '200',
      pickupDeals,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/dastakDeals', async (req, res) => {
  try {
    const { lat, long, userId } = req.body;

    let dastakDeals = [];
    let maxCountProducts;

    const restaurants = await Users.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [long, lat] },
          distanceField: 'dist',
          maxDistance: 4500,
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

    if (restaurants.length > 0) {
      const openRestaurants = await checkOpenRestaurants(
        lat,
        long,
        restaurants
      );

      if (openRestaurants.length > 0) {
        await Promise.all(
          openRestaurants.map(async ({ _id: martId }) => {
            const [restaurant, products] = await Promise.all([
              Users.findById(martId),

              Products.find({
                martId,
                dastakDeal: true,
                available: 'in stock',
              }).sort({ price: 1 }),
            ]);

            if (products.length > 0) {
              maxCountProducts = products.filter(
                product => product.maxCount !== undefined
              );

              if (userId !== '' && maxCountProducts.length > 0) {
                const date = moment()
                  .tz('Asia/Karachi')
                  .format('DD-MM-YYYY');

                const dealOrders = await Orders.find({
                  status: { $ne: 'Rejected' },
                  userId,
                  martId,
                  date,
                  dealCount: { $gt: 0 },
                })
                  .select('dealCount')
                  .lean();

                if (dealOrders.length > 0) {
                  const dealCount = dealOrders.reduce(
                    (a, b) => a + b.dealCount,
                    0
                  );

                  for (const product of maxCountProducts) {
                    product.maxCount -= dealCount;
                  }
                }
              }

              for (const product of products) {
                const details = [];

                product.restaurant = restaurant;

                if (product.type === 'deal') {
                  const options = await Flavours.findOne({ martId });
                  const { specifications: flavourSpecifications } = options;
                  const { specifications } = product;

                  await Promise.all(
                    specifications.map(
                      ({ productName, productType, flavourType }) => {
                        flavourSpecifications.map(specification => {
                          if (
                            productType === specification.productType &&
                            flavourType === specification.flavourType
                          ) {
                            details.push({
                              title: productName,
                              data: specification.data,
                            });
                          }
                        });
                      }
                    )
                  );

                  product.specifications = details;
                }

                dastakDeals = [...dastakDeals, product];
              }
            }
          })
        );
      }
    }

    return res.json({
      status: '200',
      dastakDeals,
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
