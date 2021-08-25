const Router = require('express/lib/router');
const moment = require('moment-timezone');
const { randomBytes } = require('crypto');

const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const Orders = require('../../models/ordersModel');
const { notifyUser } = require('../../notificationHandler/handler');

const router = Router();

router.get('/changePrices', async (req, res) => {
  try {
    const products = await Products.find({
      martId: '60d08f43ff57632b6250a5f4',
    });

    await Promise.all(
      products.map(product => {
        // if (product.category !== 'Dastak Deals') {
        let discountedPrice = ((20 / 100) * product.price).toFixed();
        discountedPrice = Math.round(discountedPrice / 5) * 5;
        product.discountedPrice = product.price - +discountedPrice;
        product.discount = '20';
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

router.get('/notifications', async (req, res) => {
  try {
    /*  const users = await Users.find({
      type: 'user',
      $or: [
        { playerId: { $ne: '' } },
        { playerId: { $ne: null } },
        { playerId: { $ne: undefined } },
      ],
    });

    console.log(users.length);

    let count = 0; */

    // const msg = `!Great News for Dastak Users! 😀\nFrom now on there will be no delivery charges on any order what so ever. Toh abhi mangwao abhi khao Dastak now. 😇`;
    // const msg = `Dear Dastak users due to current weather conditions 🌧. Our services are not available right now. We'll notify you once the services are resumed. We appreciate your patient. 😇`;
    // const msg = `Dear Umar to help bring your food more quickly we have updated our address policy. So kindly select your address from map if the app asks for it. Thankyou.`;
    const msg =
      'Hello. The number that you have given is powred off. Kindly contact dastak rider or your order will be cancelled';
    await notifyUser(msg, '70c3917b-3e8c-4d40-b4b3-65ded06a5534', {
      flag: 'userMsg',
    });

    /*  for (const user of users) {
      if (user.playerId && user.player !== '') {
        const msg = `Dear ${user.name} to help bring your food more quickly we have updated our address policy. So kindly select your address from map if the app asks for it. Thankyou.`;
        await notifyUser(msg, user.playerId, {});

        count += 1;
      }
    } */

    // console.log(count);
    return res.status(200).send('done');
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/aiAttempt', async (_req, res) => {
  try {
    const users = await Orders.distinct('userId', {
      orderTotal: { $gte: 400 },
    });
    const data = [];

    await Promise.all(
      users.map(async userId => {
        const user = await Users.findById(userId);

        if (user) {
          const restaurants = await Orders.distinct('martName', { userId });
          const userOrderData = [];

          await Promise.all(
            restaurants.map(async martName => {
              const [orderCount, orders] = await Promise.all([
                Orders.countDocuments({
                  martName,
                  userId,
                  orderTotal: { $gte: 400 },
                }),
                Orders.find({ martName, userId, orderTotal: { $gte: 400 } }),
              ]);

              let biggestOrder;

              if (orders.length > 0) {
                biggestOrder = orders.reduce((a, b) =>
                  a.orderTotal > b.orderTotal ? a : b
                );

                const result = {
                  restaurant: martName,
                  orderCount,
                  biggestOrder,
                };

                userOrderData.push(result);
              }
            })
          );

          const result = {
            name: user.name,
            userOrderData,
          };

          data.push(result);
        }
      })
    );

    return res.json({ data });
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

router.post('/dealMoney', async (req, res) => {
  try {
    const { martId, startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    let totalToPayForAzadiDeals = 0;
    let azadiDealCount = 0;
    let otherOrdersTotalAmount = 0;

    const [deliveryOrders, pickupOrders] = await Promise.all([
      Orders.find({
        martId,
        status: 'Delivered',
        orderType: 'Delivery',
        dateForSearching: { $gte: start, $lte: end },
      })
        .select('products orderTotal martId orderNum')
        .lean(),

      Orders.countDocuments({
        martId,
        status: 'Delivered',
        orderType: 'PickUp',
        dateForSearching: { $gte: start, $lte: end },
      }),
    ]);

    await Promise.all(
      deliveryOrders.map(async ({ products }) => {
        await Promise.all(
          products.map(async ({ productName, count, net }) => {
            if (productName.includes('Zabardast Deal')) {
              totalToPayForAzadiDeals += net;
              azadiDealCount += count;
            } else {
              otherOrdersTotalAmount += net;
            }
          })
        );
      })
    );

    const ourPercentage = ((13 / 100) * otherOrdersTotalAmount).toFixed();
    const totalAmountOfOtherOrdersToPay =
      otherOrdersTotalAmount - ourPercentage;

    // totalAmountoPay += totalAmountOfOtherOrdersToPay;

    return res.json({
      totalToPayForAzadiDeals,
      totalAmountOfOtherOrdersToPay,
      azadiDealCount,
      pickupOrders,
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

            console.log(_id);
            console.log(testProducts);
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

module.exports = router;
