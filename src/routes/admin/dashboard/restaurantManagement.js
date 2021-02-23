const Router = require('express/lib/router');
const moment = require('moment-timezone');
const { orderBy } = require('lodash');

const Users = require('../../../models/userModel');
const Orders = require('../../../models/ordersModel');

const router = Router();

router.get('/manageRestaurants', async (_req, res) => {
  try {
    const [activeRestaurants, inactiveRestaurants] = await Promise.all([
      Users.find({
        type: 'admin',
        shopType: 'restaurant',
        status: 'active',
      })
        .sort({ name: 1 })
        .lean(),

      Users.find({
        type: 'admin',
        shopType: 'restaurant',
        status: 'inactive',
      })
        .sort({ name: 1 })
        .lean(),
    ]);

    return res.json({ status: '200', activeRestaurants, inactiveRestaurants });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/restaurantCollections', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    let percentage = 0;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const restaurants = await Orders.distinct('martId', {
      paid: false,
      status: 'Delivered',
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    let data = await Promise.all(
      restaurants.map(async martId => {
        const [orders, restaurant] = await Promise.all([
          Orders.find({
            martId,
            paid: false,
            status: 'Delivered',
            dateForSearching: {
              $gte: start,
              $lte: end,
            },
          }),

          Users.findById(martId)
            .select('name phone jazzCashNumber')
            .lean(),
        ]);

        const { name: martName } = restaurant;

        if (martName === "Moody's" || martName === 'Zam Zam Restaurant') {
          percentage = 12;
        } else if (martName === 'De Fiesta Restaurant') {
          percentage = 10;
        } else if (martName === 'Mahar Murgh Pulao') {
          percentage = 20;
        } else {
          percentage = 15;
        }

        const deliveryOrders = orders.filter(
          ({ orderType }) => orderType === 'Delivery'
        );

        const pickupOrders = orders.filter(
          ({ orderType }) => orderType === 'PickUp'
        );

        const totalWithoutDelivery = orders.reduce(
          (a, b) =>
            b.deliveryCharges !== '0'
              ? a + b.orderTotal - 30
              : a + b.orderTotal,
          0
        );

        const totalOfDeliveryOrders = deliveryOrders.reduce(
          (a, b) => a + b.orderTotal,
          0
        );

        const deliveryCharges = orders.reduce(
          (a, b) => b.deliveryCharges !== '0' && a + 30,
          0
        );

        const ourProfit =
          +((percentage / 100) * totalWithoutDelivery).toFixed() +
          deliveryCharges;

        const totalToPay =
          totalOfDeliveryOrders > 0 ? totalOfDeliveryOrders - ourProfit : 0;

        return {
          martId,
          martName,
          ourProfit,
          totalToPay,
          deliveryOrders,
          pickupOrders,
          phone: restaurant.jazzCashNumber
            ? restaurant.jazzCashNumber
            : 'No Number Given',
        };
      })
    );

    const totalProfit = data.reduce((a, b) => a + b.ourProfit, 0);
    const amountToPay = data.reduce((a, b) => a + b.totalToPay, 0);

    data = orderBy(data, ['totalToPay'], ['desc']);

    return res.json({ status: '200', data, totalProfit, amountToPay });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/paidToOwners', async (req, res) => {
  try {
    let { restaurants, startDate, endDate } = req.body;

    startDate = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    restaurants = JSON.parse(restaurants);

    await Promise.all(
      restaurants.map(async ({ id }) => {
        await Promise.all([
          Users.findById(id),

          Orders.updateMany(
            {
              martId: id,
              paid: false,
              orderType: 'Delivery',
              status: { $in: ['Delivered', 'Rider Picked Up'] },
              dateForSearching: {
                $gte: startDate,
                $lte: endDate,
              },
            },
            { paid: true }
          ),
        ]);
      })
    );

    return res.json({
      status: '200',
      msg: 'Restaurants have been paid successfully',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/expensesTillNow', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    let percentage = 0;

    let end = moment().tz('Asia/Karachi');
    let start = moment(end).subtract(30, 'days');

    if (startDate !== '' && endDate !== '') {
      start = startDate;
      end = endDate;
    }

    start = moment(start, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    end = moment(end, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const restaurants = await Orders.distinct('martId', {
      status: 'Delivered',
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    let data = await Promise.all(
      restaurants.map(async martId => {
        const [orders, { name: martName }] = await Promise.all([
          Orders.find({
            paid: true,
            paidToRider: true,
            status: 'Delivered',
            martId,
            dateForSearching: { $gte: start, $lte: end },
          })
            .select('riderFare orderTotal deliveryCharges martName orderType')
            .sort({ createdAt: -1 })
            .lean(),

          Users.findById(martId),
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

        const deliveryOrders = orders.filter(
          ({ orderType }) => orderType === 'Delivery'
        );

        const totalWithoutDelivery = orders.reduce(
          (a, b) =>
            b.deliveryCharges !== '0'
              ? a + b.orderTotal - 30
              : a + b.orderTotal,
          0
        );

        const totalOfDeliveryOrders = deliveryOrders.reduce(
          (a, b) => a + b.orderTotal,
          0
        );

        const deliveryCharges = orders.reduce(
          (a, b) => b.deliveryCharges !== '0' && a + 30,
          0
        );

        const ourPercentage =
          +((percentage / 100) * totalWithoutDelivery).toFixed() +
          deliveryCharges;

        const totalPaid =
          totalOfDeliveryOrders > 0 ? totalOfDeliveryOrders - ourPercentage : 0;

        const ridersFare = deliveryOrders.reduce((a, b) => a + b.riderFare, 0);

        const ourProfit = ourPercentage - ridersFare;

        return {
          martName,
          ourProfit,
          totalPaid,
          ridersFare,
        };
      })
    );

    const totalProfit = data.reduce((a, b) => a + b.ourProfit, 0);
    const paidToRiders = data.reduce((a, b) => a + b.ridersFare, 0);
    const paidToRestaurants = data.reduce((a, b) => a + b.totalPaid, 0);

    data = orderBy(data, ['ourProfit'], ['desc']);

    return res.json({
      status: '200',
      data,
      totalProfit,
      paidToRiders,
      paidToRestaurants,
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
