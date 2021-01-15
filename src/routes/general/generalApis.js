import Router from 'express/lib/router';
import moment from 'moment-timezone';
import Exceljs from 'exceljs';

import Users from '../../models/userModel';
import Products from '../../models/productsModel';
import Marts from '../../models/martsModel';
import Orders from '../../models/ordersModel';
import { notifyUser } from '../../notificationHandler/handler';
import { sendDailyCollection } from '../../emailHandler/dailyCollections/dailyCollections';

const router = Router();

router.get('/changePrices', async (req, res) => {
  try {
    const products = await Products.find({
      martId: '',
    });

    await Promise.all(
      products.map(async product => {
        // if (product.category === 'Dastak Deals') {
        const percentage = ((20 / 100) * product.price).toFixed();

        product.price = +percentage + +product.price;
        // product.discountedPrice = +(product.price - discountedPrice);
        // product.discount = 0;
        // }

        // if (product.discount === '10') {
        // product.discount = '15';
        // const discountedPrice = ((20 / 100) * product.price).toFixed();
        // product.discountedPrice = +(product.price - discountedPrice);
        // product.discount = '20';
        // }

        await product.save();
        return product;
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
    const users = await Users.find({
      type: 'user',
      $or: [
        { playerId: { $ne: '' } },
        { playerId: { $ne: null } },
        { playerId: { $ne: undefined } },
      ],
    });

    console.log(users.length);

    let count = 0;

    // const msg = `!Great News for Dastak Users! 😀\nFrom now on there will be no delivery charges on any order what so ever. Toh abhi mangwao abhi khao Dastak now. 😇`;
    // const msg = `Dear Dastak users due to current weather conditions 🌧. Our services are not available right now. We'll notify you once the services are resumed. We appreciate your patient. 😇`;
    // const msg = `Dear Umar to help bring your food more quickly we have updated our address policy. So kindly select your address from map if the app asks for it. Thankyou.`;

    // await notifyUser(msg, '3b45ad7e-5e0e-49c3-b7ae-ef81c8ae09bd', {});

    for (const user of users) {
      if (user.playerId && user.player !== '') {
        const msg = `Dear ${user.name} to help bring your food more quickly we have updated our address policy. So kindly select your address from map if the app asks for it. Thankyou.`;
        await notifyUser(msg, user.playerId, {});

        count += 1;
      }
    }

    console.log(count);
    return res.status(200).send(count, 'count');
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/removeDiscount', async (req, res) => {
  try {
    const allUsers = await Users.find({ type: { $in: ['user', 'admin'] } });

    await Promise.all(
      allUsers.map(async user => {
        const { address } = user;

        if (
          typeof address === 'object' ||
          address instanceof Array ||
          typeof address === 'string'
        ) {
          user.address = [];
          await user.save();
        }
      })
    );

    await Promise.all(
      allUsers.map(user => {
        user.address = [];
        return user.save();
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

/* router.get('/test', async (_req, res) => {
  try {
    const categories = await Products.distinct('category', {
      martId: '5fda022f84c48616b0a5a4c0',
    });

     await Promise.all(
        userIds.map(async userId => {
          const user = await Users.findById(userId);
  
          if (user && typeof user.address === 'object') {
            const userAddresses = await Orders.distinct('address', { userId });
  
            await Promise.all(
              userAddresses.map(async userAddress => {
                const data = {
                  street: userAddress,
                  city: '',
                };
  
                await Promise.resolve(data);
                user.address.push(data);
              })
            );
  
            await Users.findByIdAndUpdate(userId, { address: user.address });
          }
        })
      );
  
      const users = await Users.find({ type: { $in: ['user', 'admin'] } });
  
      await Promise.all(
        users.map(async user => {
          const { address } = user;
  
          if (address.length > 0) {
            await Promise.all(
              address.map(async item => {
                item.city = 'Sargodha';
              })
            );
  
            await Users.findByIdAndUpdate(user._id, { address });
          }
        })
      );
  
      const users = await Marts.find({
        shopType: 'restaurant',
        status: 'active',
      });
  
      await Promise.all(
        users.map(async user => {
          user.available = true;
          await user.save();
        })
      );

    const products = await Products.find({
      martId: '5fcf7e31728d19030781f2cf',
      category: 'IceCream',
    });

    for (const product of products) {
      if (product.quantity === 'Small') {
        product.price = 100;
      }

      if (product.quantity === 'Medium') {
        product.price = 150;
      }

      if (product.quantity === 'Large') {
        product.price = 190;
      }

      await product.save();
    }

    return res.json(categories);
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

router.get('/deliveryCharges', async (req, res) => {
  try {
    const allUsers = await Marts.find({ shopType: 'restaurant' });

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
        const orders = await Orders.find({ riderName: rider, date });

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

router.post('/weeklyRidersFare', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const dateRange = `${startDate} - ${endDate}`;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const riders = await Orders.distinct('riderName', {
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    const data = await Promise.all(
      riders.map(async riderName => {
        const thisWeeksOrders = await Orders.find({
          riderName,
          paidToRider: { $in: [false, undefined] },
          orderType: 'Delivery',
          status: 'Delivered',
          dateForSearching: {
            $gte: start,
            $lte: end,
          },
        });

        const total = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);
        const riderFare = thisWeeksOrders.reduce((a, b) => a + b.riderFare, 0);

        return {
          dateRange,
          riderName,
          total,
          riderFare,
          orders: thisWeeksOrders.length,
        };
      })
    );

    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet(dateRange);

    worksheet.columns = [
      { header: 'Date Range', key: 'dateRange', width: 15 },
      { header: 'Rider Name', key: 'riderName', width: 15 },
      { header: 'Total Collection', key: 'total', width: 15 },
      { header: 'Rider Fare', key: 'riderFare', width: 15 },
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

router.post('/restaurantsCollections', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    let percentage = 0;
    let dateRange;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const restaurants = await Orders.distinct('martName', {
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    const data = await Promise.all(
      restaurants.map(async martName => {
        const thisWeeksOrders = await Orders.find({
          martName,
          paid: { $in: [false, undefined] },
          orderType: 'Delivery',
          status: 'Delivered',
          dateForSearching: {
            $gte: start,
            $lte: end,
          },
        });

        if (martName === 'De Fiesta Restaurant') {
          percentage = 10;
        } else if (
          martName === "Moody's" ||
          martName === 'Zam Zam Restaurant'
        ) {
          percentage = 12;
        } else if (martName === 'Mahar Murgh Pulao') {
          percentage = 20;
        } else {
          percentage = 15;
        }

        console.log(martName, ' ', percentage);

        const total = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);
        const withoutDelivery = thisWeeksOrders.reduce(
          (a, b) =>
            b.deliveryCharges !== '0'
              ? a + b.orderTotal - 30
              : a + b.orderTotal,
          0
        );
        const ourProfit = ((percentage / 100) * withoutDelivery).toFixed();

        console.log(martName, ' ', percentage, ' ', ourProfit);

        const totalDeliveryCharges = total - withoutDelivery;
        const totalToPayOwner = withoutDelivery - +ourProfit;
        dateRange = `${startDate} - ${endDate}`;

        const result = {
          dateRange,
          martName,
          total,
          totalToPayOwner,
          ourProfit,
          totalDeliveryCharges,
          totalOrders: thisWeeksOrders,
        };

        return result;
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
    ];

    await Promise.all(data.map(doc => worksheet.addRow(doc)));

    worksheet.getRow(1).eachCell(cell => (cell.font = { bold: true }));

    // await workbook.xlsx.writeFile(`${dateRange}.xlsx`);
    // sendDailyCollection(`${dateRange}.xlsx`);

    return res.json({ status: '200', data });
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

router.post('/dateManipulationForOrders', async (_req, res) => {
  try {
    const orders = await Orders.find();

    // Subtracts a day on local server but is fine in Production.
    await Promise.all(
      orders.map(order => {
        order.dateForSearching = moment(order.date, 'DD-MM-YYYY')
          .tz('Asia/Karachi')
          .toISOString();

        return order.save();
      })
    );

    return res.send('done');
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

export default router;
