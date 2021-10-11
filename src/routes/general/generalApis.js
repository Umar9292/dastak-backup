const Router = require('express/lib/router');
const moment = require('moment-timezone');
const { unlinkSync } = require('fs');
const { IncomingForm } = require('formidable');
const { randomBytes } = require('crypto');

const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const Orders = require('../../models/ordersModel');

const router = Router();

router.get('/changePrices', async (_req, res) => {
  try {
    const products = await Products.find({
      martId: '60c0aeaa276990031ef54af3',
    });

    await Promise.all(
      products.map(product => {
        if (product.category === 'Grilled Burgers') {
          let discountedPrice = ((40 / 100) * product.price).toFixed();
          discountedPrice = Math.round(discountedPrice / 5) * 5;
          product.discountedPrice = product.price - +discountedPrice;
          product.discount = '40';
          product.actualPrice = product.discountedPrice;
          return product.save();
        }
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
    });

    await Promise.all(
      riders.map(async rider => {
        rider.playerIds.push(
          '8eea17f7-070c-47b7-b836-bff344fa4ca5',
          'a6a5c4b2-d02e-49a9-b828-c830d3ce61d9'
        );

        // rider.playerIds = rider.playerIds.filter(
        //   id => id !== '8b7a3df9-94fc-4b79-8874-4988677a8078'
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

router.post('/addActualPrices', async (req, res) => {
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
});

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

router.post('/dealCount', async (req, res) => {
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
});

router.post('/unpayRestaurant', async (req, res) => {
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
});

router.post('/uploadPicture', (req, res) => {
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
});

router.post('/testAlgorithm', async (req, res) => {
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
});

module.exports = router;
