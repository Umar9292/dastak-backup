const Router = require('express/lib/router');
const moment = require('moment-timezone');
const { orderBy } = require('lodash');

const Users = require('../../../models/userModel');
const Orders = require('../../../models/ordersModel');

const router = Router();

router.post('/manageRestaurants', async (req, res) => {
  try {
    const { city } = req.body;

    const [activeRestaurants, inactiveRestaurants] = await Promise.all([
      Users.find({
        type: 'admin',
        status: 'active',
        city,
      })
        .sort({ name: 1 })
        .lean(),

      Users.find({
        type: 'admin',
        status: 'inactive',
        city,
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
    const { startDate, endDate, city } = req.body;

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
      city,
    });

    let data = await Promise.all(
      restaurants.map(async martId => {
        const [orders, restaurant] = await Promise.all([
          Orders.find({
            paid: false,
            status: 'Delivered',
            martId,
            city,
            dateForSearching: {
              $gte: start,
              $lte: end,
            },
          }).lean(),

          Users.findById(martId)
            .select('name phone jazzCashNumber percentage')
            .lean(),
        ]);

        const { name: martName, percentage } = restaurant;

        const deliveryOrders = orders.filter(
          ({ orderType }) => orderType === 'Delivery'
        );

        const pickupOrders = orders.filter(
          ({ orderType }) => orderType === 'PickUp'
        );

        let dealPayment = 0;
        let nonDealPayment = 0;

        await Promise.all(
          orders.map(async ({ products }) => {
            await Promise.all(
              products.map(async product => {
                const { productName, net, count } = product;

                if (
                  !productName.includes('Azadi Deal') &&
                  !productName.includes('Discounted Deal') &&
                  !productName.includes('Zabardast Deal')
                ) {
                  nonDealPayment += net;
                }

                if (product.actualPrice !== undefined) {
                  dealPayment += product.actualPrice * count;
                }
              })
            );
          })
        );

        const totalOfDeliveryOrders = deliveryOrders.reduce(
          (a, b) => a + b.orderTotal,
          0
        );

        const ourProfit = ((percentage / 100) * nonDealPayment).toFixed();
        const totalToPay = dealPayment + (nonDealPayment - ourProfit);

        return {
          martId,
          martName,
          ourProfit: +ourProfit,
          totalOfDeliveryOrders,
          dealPayment,
          nonDealPayment,
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
    const totalCollection = data.reduce(
      (a, b) => a + b.totalOfDeliveryOrders,
      0
    );

    data = orderBy(data, ['totalToPay'], ['desc']);

    return res.json({
      status: '200',
      data,
      totalProfit,
      amountToPay,
      totalCollection,
    });
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
    const { startDate, endDate, city } = req.body;

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
      city,
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    let data = await Promise.all(
      restaurants.map(async martId => {
        const [orders, { name: martName, percentage }] = await Promise.all([
          Orders.find({
            status: 'Delivered',
            martId,
            city,
            dateForSearching: { $gte: start, $lte: end },
          })
            .select('riderFare orderTotal deliveryCharges martName orderType')
            .sort({ createdAt: -1 })
            .lean(),

          Users.findById(martId),
        ]);

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

        const deliveryCharges = deliveryOrders.reduce(
          (a, b) => (b.deliveryCharges !== '0' ? a + 30 : a),
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
