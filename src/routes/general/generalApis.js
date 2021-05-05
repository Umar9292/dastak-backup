const Router = require('express/lib/router');
const moment = require('moment-timezone');
const Exceljs = require('exceljs');
const { randomBytes } = require('crypto');

const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const Orders = require('../../models/ordersModel');
const { notifyUser } = require('../../notificationHandler/handler');
const {
  sendDailyCollection,
} = require('../../emailHandler/dailyCollections/dailyCollections');

const router = Router();

router.get('/changePrices', async (req, res) => {
  try {
    const products = await Products.find({
      martId: '5ffc52f0ae4f9b02e5ba52be',
    });

    await Promise.all(
      products.map(product => {
        let discountedPrice = ((70 / 100) * product.price).toFixed();
        discountedPrice = Math.round(discountedPrice / 5) * 5;
        product.discountedPrice = +product.price - discountedPrice;
        product.discount = '70';
        return product.save();
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
    await notifyUser(msg, 'cb712449-673d-4867-aab5-2ff36f118549', {});

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

router.post('/collections', async (req, res) => {
  try {
    let { startDate, endDate } = req.body;

    startDate = moment(startDate, 'DD-MM-YYYY').tz('Asia/Karachi');
    endDate = moment(endDate, 'DD-MM-YYYY').tz('Asia/Karachi');

    const thisWeeksOrders = await Orders.find({
      paid: false,
      status: { $in: ['Delivered', 'Rider Picked Up'] },
      orderType: 'Delivery',
      dateForSearching: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const total = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);
    const ordersWithDeliveryCharges = thisWeeksOrders.filter(
      order => order.deliveryCharges !== '0'
    );
    const excludingDeliveryCharges =
      total - ordersWithDeliveryCharges.length * 30;
    const deliveryCharges = ordersWithDeliveryCharges.length * 30;
    const riderFare = thisWeeksOrders.reduce((a, b) => a + b.riderFare, 0);
    const ourProfit =
      +((12 / 100) * excludingDeliveryCharges).toFixed() +
      deliveryCharges -
      riderFare;

    return res.json({
      total,
      ourProfit,
      deliveryCharges,
      excludingDeliveryCharges,
      riderFare,
      status: '200',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/riderCollections', async (req, res) => {
  try {
    const { date } = req.body;

    const riders = await Orders.distinct('riderName', { date });

    const data = await Promise.all(
      riders.map(async rider => {
        const orders = await Orders.find({ riderName: rider, date });

        const collection = orders.reduce((a, b) => a + b.orderTotal, 0);

        const result = {
          rider,
          collection,
        };

        return result;
      })
    );

    const totalCollection = data.reduce((a, b) => a + b.collection, 0);

    return res.json({
      riders,
      totalCollection,
      data,
      status: '200',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/deliveryCharges', async (req, res) => {
  try {
    const allUsers = await Users.find({ shopType: 'restaurant' });

    await Promise.all(
      allUsers.map(async user => {
        user.deliveryCharges = '30';
        await user.save();
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

router.post('/dailyRiderCollections', async (req, res) => {
  try {
    const { date } = req.body;

    const riders = await Orders.distinct('riderName', { date });

    const data = await Promise.all(
      riders.map(async rider => {
        const orders = await Orders.find({
          riderName: rider,
          date,
          status: { $ne: 'Rejected' },
          paidToRider: false,
          orderType: 'Delivery',
        });

        const collection = orders.reduce((a, b) => a + b.orderTotal, 0);

        return {
          rider,
          collection,
        };
      })
    );

    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet(`${date}`);

    worksheet.columns = [
      { header: 'Rider', key: 'rider', width: 15 },
      { header: 'Collection', key: 'collection', width: 15 },
    ];

    await Promise.all(data.map(doc => worksheet.addRow(doc)));

    worksheet.getRow(1).eachCell(cell => (cell.font = { bold: true }));

    await workbook.xlsx.writeFile(`${date}.xlsx`);
    await sendDailyCollection(`${date}.xlsx`);

    const totalCollection = data.reduce((a, b) => a + b.collection, 0);

    return res.json({
      riders,
      totalCollection,
      data,
      status: '200',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/restaurantsCollections', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    let dateRange;
    let percentage = 0;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const restaurants = await Orders.distinct('martName', {
      paid: false,
      status: 'Delivered',
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    const data = await Promise.all(
      restaurants.map(async martName => {
        const [thisWeeksOrders, restaurant] = await Promise.all([
          Orders.find({
            martName,
            paid: { $in: [false, undefined] },
            orderType: 'Delivery',
            status: 'Delivered',
            dateForSearching: {
              $gte: start,
              $lte: end,
            },
          }),

          Users.findOne({ name: martName }),
        ]);

        if (martName === "Moody's" || martName === 'Zam Zam Restaurant') {
          percentage = 12;
        } else if (martName === 'De Fiesta Restaurant') {
          percentage = 10;
        } else if (martName === 'Mahar Murgh Pulao') {
          percentage = 20;
        } else {
          percentage = 15;
        }

        const total = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);
        const withoutDelivery = thisWeeksOrders.reduce(
          (a, b) =>
            b.deliveryCharges !== '0'
              ? a + b.orderTotal - 30
              : a + b.orderTotal,
          0
        );
        const ourProfit = ((percentage / 100) * withoutDelivery).toFixed();
        const totalDeliveryCharges = total - withoutDelivery;
        const totalToPayOwner = withoutDelivery - +ourProfit;
        dateRange = `${startDate} - ${endDate}`;

        return {
          dateRange,
          martName,
          total,
          totalToPayOwner,
          ourProfit,
          totalDeliveryCharges,
          totalOrders: thisWeeksOrders,
          jazzCashNumber:
            restaurant && restaurant.jazzCashNumber
              ? restaurant.jazzCashNumber
              : 'No Number Given',
        };
      })
    );

    const [totalAmount, amountToPay] = [
      data.reduce((a, b) => a + b.total, 0),
      data.reduce((a, b) => a + b.totalToPayOwner, 0),
    ];

    await Promise.all(
      data.map(doc => {
        doc.totalAmount = totalAmount;
        doc.amountToPay = amountToPay;
      })
    );

    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet(dateRange);

    worksheet.columns = [
      { header: 'Date Range', key: 'dateRange', width: 15 },
      { header: 'Total Amount', key: 'total', width: 15 },
      { header: 'Restaurant Name', key: 'martName', width: 15 },
      { header: 'After Percentage', key: 'totalToPayOwner', width: 15 },
      { header: 'Profit', key: 'ourProfit', width: 15 },
      { header: 'Delivery Charges', key: 'totalDeliveryCharges', width: 15 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Total Amount to Pay', key: 'amountToPay', width: 15 },
      { header: 'Jazz Cash', key: 'jazzCashNumber', width: 15 },
    ];

    await Promise.all(data.map(doc => worksheet.addRow(doc)));

    worksheet.getRow(1).eachCell(cell => (cell.font = { bold: true }));

    await workbook.xlsx.writeFile(`${dateRange}.xlsx`);
    sendDailyCollection(`${dateRange}.xlsx`);

    return res.json({ status: '200', data });
  } catch (err) {
    console.log(err);
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

router.post('/specificRestaurantDetails', async (req, res) => {
  try {
    const { startDate, endDate, martId } = req.body;
    let dateRange;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const orders = await Orders.find({
      martId,
      paid: false,
      orderType: 'Delivery',
      status: 'Delivered',
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    const data = await Promise.all(
      orders.map(order => {
        const totalWithoutdelivery =
          order.deliveryCharges === '0'
            ? order.orderTotal
            : order.orderTotal - 30;

        return {
          date: order.date,
          total: totalWithoutdelivery,
        };
      })
    );

    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet(dateRange);

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Order Total', key: 'total', width: 15 },
    ];

    await Promise.all(data.map(doc => worksheet.addRow(doc)));

    worksheet.getRow(1).eachCell(cell => (cell.font = { bold: true }));

    await workbook.xlsx.writeFile(`${dateRange}.xlsx`);
    sendDailyCollection(`${dateRange}.xlsx`);

    return res.json({ status: '200', data });
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
    const { searchFlag, updateFlag } = req.body;

    await Users.updateMany(
      {
        shopType: 'restaurant',
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

router.get('/riderFares', async (_req, res) => {
  try {
    const riders = await Users.find({
      type: 'rider',
      status: { $ne: 'inactive' },
    });

    await Promise.all(
      riders.map(async rider => {
        if (rider.name === 'Amir Naveed' || rider.name === 'Ali Hashim') {
          rider.tillNoonFare = 70;
          rider.nightFare = 90;
        } else {
          rider.tillNoonFare = 60;
          rider.nightFare = 80;
        }

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

router.get('/readRiderExcelSheet', async (_req, res) => {
  try {
    const workbook = new Exceljs.Workbook();

    const sheet = workbook.xlsx.readFile(`${process.cwd()}/jazzCash.xlsx`);
    const worksheet = (await sheet).getWorksheet('Sheet1');

    worksheet.eachRow({ includeEmpty: false }, async row => {
      const martName = row.getCell(`A`).value;
      const phone = row.getCell(`B`).value;

      const restaurant = await Users.findOne({ name: martName });

      if (restaurant) {
        restaurant.jazzCashNumber = phone;
        await restaurant.save();
      }
    });

    return res.send('Done');
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/readRestaurantExcelSheet', async (req, res) => {
  try {
    let { startDate, endDate } = req.body;

    startDate = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const workbook = new Exceljs.Workbook();

    const sheet = workbook.xlsx.readFile(`${process.cwd()}/sheets.xlsx`);
    const worksheet = (await sheet).getWorksheet('04-02-2021 - 10-02-2021');

    const marts = [];

    worksheet.eachRow({ includeEmpty: false }, async row => {
      const martName = row.getCell(`C`).value;
      marts.push(martName);
    });

    await Promise.all(
      marts.map(async martName => {
        await Orders.updateMany(
          {
            martName,
            paid: { $in: [false, undefined] },
            orderType: 'Delivery',
            status: { $in: ['Delivered', 'Rider Picked Up'] },
            dateForSearching: {
              $gte: startDate,
              $lte: endDate,
            },
          },
          { paid: true }
        );
      })
    );

    return res.send('Done');
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
        // rider.playerIds.push('b936bcdd-6149-442b-ba13-0aec0e330284');

        rider.playerIds = rider.playerIds.filter(
          id => id !== 'e24cbaea-ef99-47c6-af4a-0614f0368bb2'
        );

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
    const { restaurant, startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    if (restaurant === 'Pizza Vizza Hut' || restaurant === 'What a Pizza') {
      let totalDeliveryProducts = 0;
      let totalPickupProducts = 0;

      const orders = await Orders.find({
        martName: restaurant,
        status: 'Delivered',
        dateForSearching: { $gte: start, $lte: end },
      });

      const pickupOrders = orders.filter(order => order.orderType === 'PickUp');
      const deliveryOrders = orders.filter(
        order => order.orderType === 'Delivery'
      );

      await Promise.all([
        deliveryOrders.map(async ({ products }) => {
          await Promise.all(
            products.map(({ productName, count }) => {
              if (productName === 'Zabardast Deal 1') {
                totalDeliveryProducts += count;
              }
            })
          );
        }),

        pickupOrders.map(async ({ products }) => {
          await Promise.all(
            products.map(({ productName, count }) => {
              if (productName === 'Zabardast Deal 1') {
                totalPickupProducts += count;
              }
            })
          );
        }),
      ]);

      const totalOfPickupOrders = totalPickupProducts * 27;
      const totalToPay = totalDeliveryProducts * 126;

      return res.json({
        totalDeliveryProducts,
        totalPickupProducts,
        totalToPay,
        totalOfPickupOrders,
      });
    }

    if (restaurant === 'Khan Baba Hotel') {
      let totalDeliveryProducts = 0;
      let totalPickupProducts = 0;

      const orders = await Orders.find({
        martName: restaurant,
        status: 'Delivered',
        dateForSearching: { $gte: start, $lte: end },
      });

      const pickupOrders = orders.filter(order => order.orderType === 'PickUp');
      const deliveryOrders = orders.filter(
        order => order.orderType === 'Delivery'
      );

      await Promise.all([
        deliveryOrders.map(async ({ products }) => {
          await Promise.all(
            products.map(({ productName, count }) => {
              if (productName.includes('Discounted Deal')) {
                totalDeliveryProducts += count;
              }
            })
          );
        }),

        pickupOrders.map(async ({ products }) => {
          await Promise.all(
            products.map(({ productName, count }) => {
              if (productName.includes('Discounted Deal')) {
                totalPickupProducts += count;
              }
            })
          );
        }),
      ]);

      const totalOfPickupOrders = totalPickupProducts * 6;
      const totalToPay = totalDeliveryProducts * 105;

      return res.json({
        totalDeliveryProducts,
        totalPickupProducts,
        totalToPay,
        totalOfPickupOrders,
      });
    }

    if (restaurant === 'Cafe Crew') {
      const orders = await Orders.find({
        martName: restaurant,
        status: 'Delivered',
        orderType: 'Delivery',
        dateForSearching: { $gte: start, $lte: end },
      });

      let productCount = 0;

      await Promise.all(
        orders.map(async ({ products }) => {
          await Promise.all(
            products.map(({ productName, count }) => {
              if (productName.includes('Zabardast Deal')) {
                productCount += count;
              }
            })
          );
        })
      );

      const amountToPay = productCount * 99;

      return res.json({
        productCount,
        amountToPay,
      });
    }

    if (restaurant === 'De Fiesta Restaurant') {
      let totalAmount = 0;
      let dealCount = 0;

      const [orders, pickupOrders] = await Promise.all([
        Orders.find({
          martName: restaurant,
          status: 'Delivered',
          orderType: 'Delivery',
          dateForSearching: { $gte: start, $lte: end },
        })
          .select('products orderTotal martId orderNum')
          .lean(),

        Orders.countDocuments({
          martName: restaurant,
          status: 'Delivered',
          orderType: 'PickUp',
          dateForSearching: { $gte: start, $lte: end },
        }),
      ]);

      await Promise.all(
        orders.map(async ({ products, martId }) => {
          await Promise.all(
            products.map(async ({ productName, count, net }) => {
              const { price } = await Products.findOne({
                martId,
                productName,
              })
                .select('price')
                .lean();

              /* if (productName.includes('Ramadan Deal')) {
                dealCount += count;

                const subTotal = price + 11;

                totalAmount += subTotal;
              } */

              if (!productName.includes('Ramadan Deal')) {
                dealCount += count;

                const tenPercentOfNet = ((10 / 100) * price).toFixed();
                const subTotal = net - tenPercentOfNet;

                totalAmount += subTotal;
              }
            })
          );
        })
      );

      return res.json({
        totalAmount,
        dealCount,
        amountToPay: totalAmount,
        pickupOrders,
      });
    }
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
