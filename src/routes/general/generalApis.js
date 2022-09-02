const Router = require('express/lib/router');
const moment = require('moment-timezone');
// const { unlinkSync } = require('fs');
// const { IncomingForm } = require('formidable');
const { randomBytes } = require('crypto');
// const { uniqBy } = require('lodash');

const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const Orders = require('../../models/ordersModel');
// const Categories = require('../../models/categoriesModel');
// const FlavoursAndDrinks = require('../../models/flavoursAndDrinks');

const router = Router();

router.get('/changePrices', async (_req, res) => {
  try {
    const products = await Products.find({
      martId: '62d67188252d83a0964ca631',
    });

    await Promise.all(
      products.map(product => {
        // if (product.category !== 'Dastak Deals') {
        let discountedPrice = ((20 / 100) * product.price).toFixed();
        discountedPrice = Math.round(discountedPrice / 5) * 5;
        product.price += +discountedPrice;
        // product.discount = '0';
        // product.actualPrice = product.discountedPrice;
        return product.save();
        // }
      })
    );

    return res.json('done');
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/closeRestaurants', async (req, res) => {
  try {
    const { searchFlag, updateFlag, city } = req.body;

    await Users.updateMany(
      {
        city,
        type: 'admin',
        status: 'active',
        available: searchFlag,
      },
      { available: updateFlag }
    );

    return res.json({ status: '200', msg: 'done' });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/createRidersPassword', async (_req, res) => {
  try {
    const riders = await Users.find({ type: 'rider' });

    await Promise.all(
      riders.map(async rider => {
        const newPassword = randomBytes(4);
        rider.password = newPassword.toString('hex');
        await rider.save();
      })
    );

    return res.json({ riders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

/* router.get('/test', async (_req, res) => {
  try {
    const riders = await Users.find({
      shopType: 'restaurant',
      status: 'active',
    });

    console.log(riders.length);

    await Promise.all(
      riders.map(async rider => {
        rider.playerIds.push('834173c1-ba3e-4260-9a45-fe6e1bac0097');

        // rider.playerIds = rider.playerIds.filter(
        //   id => id !== '834173c1-ba3e-4260-9a45-fe6e1bac0097'
        // );

        await rider.save();
      })
    );

    return res.json({ riders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.post('/addActualPrices', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const restaurants = await Orders.distinct('martId', {
      status: 'Delivered',
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    await Promise.all(
      restaurants.map(async martId => {
        const orders = await Orders.find({
          martId,
          status: 'Delivered',
          dateForSearching: { $gte: start, $lte: end },
        });

        await Promise.all(
          orders.map(async order => {
            const { products, _id } = order;
            let testProducts = [];

            await Promise.all(
              products.map(async p => {
                const { productName, quantity } = p;

                if (
                  productName.includes('Azadi Deal') ||
                  productName.includes('Discounted Deal') ||
                  productName.includes('Zabardast Deal')
                ) {
                  const product = await Products.findOne({
                    martId,
                    productName,
                    quantity,
                  });

                  if (!product) {
                    console.log(`order id = ${_id}`);
                  }

                  if (product.actualPrice !== undefined) {
                    p.actualPrice = product.actualPrice;
                    testProducts = [...testProducts, p];
                  }
                } else {
                  testProducts = [...testProducts, p];
                }
              })
            );

            await Orders.findByIdAndUpdate(_id, { products: testProducts });
          })
        );
      })
    );

    return res.json({ status: '200' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.post('/addActualPrices', async (req, res) => {
  try {
    const { startDate, endDate, martId } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const orders = await Orders.find({
      martId,
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    await Promise.all(
      orders.map(async order => {
        const { products, _id } = order;
        let testProducts = [];

        await Promise.all(
          products.map(async p => {
            const { productName, quantity } = p;

            if (
              productName.includes('Azadi Deal') ||
              productName.includes('Discounted Deal') ||
              productName.includes('Zabardast Deal')
            ) {
              const product = await Products.findOne({
                martId,
                productName,
                quantity,
              });

              if (!product) {
                console.log(`order id = ${_id}`);
              }

              if (product.actualPrice !== undefined) {
                p.actualPrice = product.actualPrice;
                testProducts = [...testProducts, p];
              }
            } else {
              testProducts = [...testProducts, p];
            }
          })
        );

        await Orders.findByIdAndUpdate(_id, { products: testProducts });
      })
    );

    return res.json({ status: '200' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.post('/dealCount', async (req, res) => {
  try {
    const { martId, startDate, endDate, dealName } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    let small = 0;
    let medium = 0;
    let large = 0;

    const deliveryOrders = await Orders.find({
      martId,
      status: 'Delivered',
      orderType: 'Delivery',
      dateForSearching: { $gte: start, $lte: end },
    })
      .select('products')
      .lean();

    await Promise.all(
      deliveryOrders.map(async ({ products }) => {
        await Promise.all(
          products.map(async ({ productName, count, quantity }) => {
            if (productName.includes(dealName)) {
              if (quantity.includes('Small')) {
                small += count;
              }

              if (quantity.includes('Medium')) {
                medium += count;
              }

              if (quantity.includes('Large')) {
                large += count;
              }
            }
          })
        );
      })
    );

    return res.json({
      small,
      medium,
      large,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.post('/unpayRestaurant', async (req, res) => {
  try {
    const { martId, startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const updatedOrders = await Orders.updateMany(
      {
        martId,
        dateForSearching: {
          $gte: start,
          $lte: end,
        },
      },
      { paid: false }
    );

    return res.json({ updatedOrders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.post('/uploadPicture', (req, res) => {
  try {
    const form = new IncomingForm();

    form.uploadDir = 'uploads';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;

    form.parse(req, async (_err, _fields, files) => {
      const img = files.image.path;

      const user = await Users.findByIdAndUpdate(
        { _id: '5f312d42d9d50a3bebf4611a' },
        { img },
        { new: true }
      );

      unlinkSync(img);

      return res.json(user);
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg:
        'Looks like something went wrong on our side. Sorry for the incinvenience',
    });
  }
}); */

/* router.post('/testAlgorithm', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const users = await Orders.distinct('userId', {
      status: 'Delivered',
      city: 'Sargodha',
      orderTotal: { $gte: 400 },
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    const usersOrderData = await Promise.all(
      users.map(async userId => {
        const thisUsersOrders = await Orders.find({
          status: 'Delivered',
          userId,
          orderTotal: { $gte: 400 },
          dateForSearching: {
            $gte: start,
            $lte: end,
          },
        })
          .select('time date products name')
          .lean();

        const [dates, times] = await Promise.all([
          thisUsersOrders.map(({ date }) => date),
          thisUsersOrders.map(({ time }) => time),
        ]);

        return {
          name: thisUsersOrders[0].name,
          totalOrders: thisUsersOrders.length,
          dates,
          times,
        };
      })
    );

    return res.json({ usersOrderData });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.get('/addSpecificationsInProducts', async (_req, res) => {
  try {
    const dealProducts = await Products.find({
      type: 'deal',
      sizes: { $ne: undefined },
    });

    await Promise.all(
      dealProducts.map(async product => {
        let specifications = [];

        const { sizes, drinks } = product;

        if (drinks) {
          specifications = [
            ...specifications,
            {
              productName: 'Choose your drink',
              productType: 'drink',
              flavourType: 'regular',
            },
          ];
        }

        let smallPizzaCount = 1;
        let mediumPizzaCount = 1;
        let largePizzaCount = 1;

        sizes.map(({ value }) => {
          if (value.includes('Small')) {
            specifications = [
              ...specifications,
              {
                productName: `Small Pizza ${smallPizzaCount}`,
                productType: 'pizza',
                flavourType: product.regular
                  ? 'regular'
                  : product.dealFlavours
                  ? 'deal'
                  : 'special',
              },
            ];

            smallPizzaCount += 1;
          }

          if (value.includes('Medium')) {
            specifications = [
              ...specifications,
              {
                productName: `Medium Pizza ${mediumPizzaCount}`,
                productType: 'pizza',
                flavourType: product.regular
                  ? 'regular'
                  : product.dealFlavours
                  ? 'deal'
                  : 'special',
              },
            ];

            mediumPizzaCount += 1;
          }

          if (value.includes('Large')) {
            specifications = [
              ...specifications,
              {
                productName: `Large Pizza ${largePizzaCount}`,
                productType: 'pizza',
                flavourType: product.regular
                  ? 'regular'
                  : product.dealFlavours
                  ? 'deal'
                  : 'special',
              },
            ];

            largePizzaCount += 1;
          }
        });

        product.specifications = specifications;
        await product.save();
      })
    );

    return res.json({ dealProducts });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.get('/updateFares', async (_req, res) => {
  try {
    const riders = await Users.updateMany(
      { type: 'rider', city: 'Sargodha' },
      { tillNoonFare: 90, nightFare: 90, lateNightFare: 90 }
    );

    return res.json({ riders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.post('/jazzCashCallback', async (req, res) => {
  console.log(req.body);

  return res.redirect(
    `https://dastakbackend.herokuapp.com/alreadyVerified/views`
  );
}); */

/* router.get('/modifyCategories', async (_req, res) => {
  try {
    const restaurants = await Categories.find();

    restaurants.map(restaurant => {
      const { categories } = restaurant;
      const newCategories = [];
      categories.map(category => {
        newCategories.push({
          name: category,
          startTime: '',
          endTime: '',
        });

        restaurant.categories = newCategories;
      });

      restaurant.save();
    });

    res.json({ status: '200' });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.get('/modifyFlavoursAndDrinks', async (_req, res) => {
  try {
    const flavoursAndDrinks = await FlavoursAndDrinks.find();

    flavoursAndDrinks.map(async doc => {
      let data = [];

      if (doc.flavours) {
        await Promise.all(
          doc.flavours.map(flavour => {
            const { name } = flavour;

            data = [...data, { count: 0, txt: name }];
          })
        );

        const specifications = {
          productType: 'pizza',
          flavourType: 'special',
          data,
        };

        doc.specifications = [...doc.specifications, specifications];
        await doc.save();
      }

      if (doc.regularFlavours) {
        let data = [];

        await Promise.all(
          doc.regularFlavours.map(flavour => {
            const { name } = flavour;

            data = [...data, { count: 0, txt: name }];
          })
        );

        const specifications = {
          productType: 'pizza',
          flavourType: 'regular',
          data,
        };

        doc.specifications = [...doc.specifications, specifications];
        await doc.save();
      }

      if (doc.dealFlavours) {
        let data = [];

        await Promise.all(
          doc.dealFlavours.map(flavour => {
            const { name } = flavour;

            data = [...data, { count: 0, txt: name }];
          })
        );

        const specifications = {
          productType: 'pizza',
          flavourType: 'deal',
          data,
        };

        doc.specifications = [...doc.specifications, specifications];
        await doc.save();
      }

      if (doc.drinks) {
        let data = [];

        await Promise.all(
          doc.drinks.map(drink => {
            const { name } = drink;

            data = [...data, { count: 0, txt: name }];
          })
        );

        const specifications = {
          productType: 'drinks',
          flavourType: 'regular',
          data,
        };

        doc.specifications = [...doc.specifications, specifications];
        await doc.save();
      }
    });

    res.json({ status: '200' });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.post('/averageRestaurantMetrics', async (req, res) => {
  try {
    let { startDate, endDate, dateRange } = req.body;

    startDate = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/karachi')
      .toISOString();
    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/karachi')
      .toISOString();

    const orders = await Orders.find({
      status: 'Delivered',
      dateForSearching: { $gte: startDate, $lte: endDate },
    })
      .select('orderTotal martId martName')
      .lean();

    const overallAvgOrderTotal =
      orders.reduce((a, b) => a + b.orderTotal, 0) / orders.length;

    const restaurants = uniqBy(orders, 'martId');

    const avgOrdersPerRestaurant = await Promise.all(
      restaurants.map(async ({ martId, martName }) => {
        const restaurantOrders = await Orders.find({
          martId,
          status: 'Delivered',
          reason: '',
          dateForSearching: { $gte: startDate, $lte: endDate },
        })
          .select('orderTotal')
          .lean();

        const avgOrderAmount =
          restaurantOrders.reduce((a, b) => a + b.orderTotal, 0) /
          restaurantOrders.length;

        return {
          restaurant: martName,
          avgOrders: restaurantOrders.length / dateRange,
          avgOrderAmount,
        };
      })
    );

    res.json({ overallAvgOrderTotal, avgOrdersPerRestaurant });
  } catch (error) {
    console.log(error);
    return res.json({ status: '404' });
  }
}); */

router.post('/testAlgorithm', async (req, res) => {
  try {
    const { startDate, endDate, count } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const users = await Orders.distinct('userId', {
      status: 'Delivered',
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    let userCount = 0;

    await Promise.all(
      users.map(async userId => {
        const thisUsersOrders = await Orders.find({
          status: 'Delivered',
          userId,
          dateForSearching: {
            $gte: start,
            $lte: end,
          },
        })
          .select('time date products name')
          .lean();

        if (thisUsersOrders.length >= count) {
          userCount += 1;
        }
      })
    );

    return res.json({ userCount });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
