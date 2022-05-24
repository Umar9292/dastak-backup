const Router = require('express/lib/router');
const moment = require('moment-timezone');
const { orderBy } = require('lodash');

const Users = require('../../../models/userModel');
const Orders = require('../../../models/ordersModel');
const PaymentHistory = require('../../../models/paymentHistoryModel');

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
      $or: [
        { status: 'Delivered', paid: false },
        { status: 'Rejected', refundToRestaurant: true, paid: false },
      ],
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
            $or: [
              { status: 'Delivered', paid: false },
              { status: 'Rejected', refundToRestaurant: true, paid: false },
            ],
            martId,
            city,
            dateForSearching: {
              $gte: start,
              $lte: end,
            },
          })
            .select(
              'riderFare deliveryCharges martName products paymentType paymentMethod onlineAmount orderType orderTotal orderNum date time discount'
            )
            .sort({ createdAt: -1 })
            .lean(),

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
        let ourProfit = 0;
        let pickUpPercentage = 0;
        let dealPaymentToShowRestaurant = 0;
        let serviceChargePercentage = 0;

        await Promise.all(
          orders.map(async order => {
            const {
              products,
              orderType,
              paymentType,
              paymentMethod,
              orderTotal,
              discount,
            } = order;

            await Promise.all(
              products.map(async product => {
                const { net, count } = product;

                if (
                  orderType === 'Delivery' &&
                  product.actualPrice === undefined
                ) {
                  nonDealPayment += net;
                }

                if (
                  product.actualPrice === undefined &&
                  orderType === 'PickUp'
                ) {
                  const ourPercentage = +((percentage / 100) * net).toFixed();
                  pickUpPercentage += ourPercentage;
                }

                if (product.actualPrice !== undefined) {
                  const priceDifference = net - product.actualPrice * count;

                  if (orderType === 'PickUp') {
                    ourProfit += priceDifference;
                  } else {
                    dealPayment += product.net;
                    dealPaymentToShowRestaurant += product.actualPrice * count;
                    ourProfit += priceDifference;
                  }
                }
              })
            );

            ourProfit -= +discount;

            if (paymentMethod === 'Debit/Credit Card') {
              if (paymentType === 'split' || paymentType === 'online') {
                serviceChargePercentage = (
                  (2.75 / 100) *
                  order.onlineAmount
                ).toFixed();
              } else {
                serviceChargePercentage = ((2.75 / 100) * orderTotal).toFixed();
              }
            }

            if (paymentMethod === 'Easypaisa') {
              if (paymentType === 'split' || paymentType === 'online') {
                serviceChargePercentage = (
                  (4 / 100) *
                  order.onlineAmount
                ).toFixed();
              } else {
                serviceChargePercentage = ((4 / 100) * orderTotal).toFixed();
              }
            }
          })
        );

        const totalOfDeliveryOrders = deliveryOrders.reduce(
          (a, b) => a + b.orderTotal + +b.discount,
          0
        );

        const deliveryCharges = deliveryOrders.reduce(
          (a, b) => a + +b.deliveryCharges,
          0
        );

        const ourPercentage = +((percentage / 100) * nonDealPayment).toFixed();

        const totalToPay =
          dealPayment +
          (nonDealPayment - ourPercentage - ourProfit - pickUpPercentage);

        console.log(serviceChargePercentage);

        ourProfit +=
          ourPercentage +
          deliveryCharges +
          pickUpPercentage +
          +serviceChargePercentage;

        nonDealPayment = nonDealPayment - ourPercentage - pickUpPercentage;

        return {
          martId,
          martName,
          orderCount: deliveryOrders.length,
          ourProfit,
          totalOfDeliveryOrders,
          dealPayment: dealPaymentToShowRestaurant,
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
      restaurants.map(async ({ id, paidAmount, orderCount }) => {
        const history = {
          martId: id,
          startDate,
          endDate,
          paidAmount,
          orderCount,
        };
        await Promise.all([
          new PaymentHistory(history).save(),

          Orders.updateMany(
            {
              martId: id,
              $or: [
                { status: 'Delivered', paid: false },
                { status: 'Rejected', refundToRestaurant: true },
              ],
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

router.post('/previouslyPaidAmount', async (req, res) => {
  try {
    const { startDate, endDate, city } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const restaurants = await Orders.distinct('martId', {
      paid: true,
      status: { $in: ['Delivered', 'Rejected'] },
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
            paid: true,
            status: { $in: ['Delivered', 'Rejected'] },
            martId,
            city,
            dateForSearching: {
              $gte: start,
              $lte: end,
            },
          }).lean(),

          Users.findById(martId)
            .select('name percentage')
            .lean(),
        ]);

        const { name: martName, percentage } = restaurant;

        let dealPayment = 0;
        let nonDealPayment = 0;
        let ourProfit = 0;

        await Promise.all(
          orders.map(async ({ products, orderType }) => {
            await Promise.all(
              products.map(async product => {
                const { net, count } = product;

                if (
                  orderType === 'Delivery' &&
                  product.actualPrice === undefined
                ) {
                  nonDealPayment += net;
                }

                if (
                  product.actualPrice === undefined &&
                  orderType === 'PickUp'
                ) {
                  const ourPercentage = +((percentage / 100) * net).toFixed();
                  ourProfit += ourPercentage;
                }

                if (product.actualPrice !== undefined) {
                  const priceDifference = net - product.actualPrice * count;

                  if (orderType === 'PickUp') {
                    ourProfit += priceDifference;
                  } else {
                    dealPayment += product.net;
                    ourProfit += priceDifference;
                  }
                }
              })
            );
          })
        );

        const ourPercentage = +((percentage / 100) * nonDealPayment).toFixed();
        const paidAmount =
          dealPayment + (nonDealPayment - ourPercentage - ourProfit);

        return {
          martName,
          paidAmount,
          orderCount: orders.length,
        };
      })
    );

    data = orderBy(data, ['paidAmount'], ['desc']);

    return res.json({ status: '200', data });
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
      city,
      $or: [
        { status: 'Delivered' },
        { status: 'Rejected', refundToRestaurant: true },
      ],
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    let data = await Promise.all(
      restaurants.map(async martId => {
        const [orders, { name: martName, percentage }] = await Promise.all([
          Orders.find({
            $or: [
              { status: 'Delivered' },
              { status: 'Rejected', refundToRestaurant: true },
            ],
            martId,
            city,
            dateForSearching: { $gte: start, $lte: end },
          })
            .select(
              'riderFare deliveryCharges discount paymentType paymentMethod onlineAmount martName products orderType orderTotal'
            )
            .sort({ createdAt: -1 })
            .lean(),

          Users.findById(martId)
            .select('name percentage')
            .lean(),
        ]);

        let dealPayment = 0;
        let nonDealPayment = 0;
        let ourProfit = 0;
        let serviceChargePercentage = 0;

        await Promise.all(
          orders.map(async order => {
            const {
              products,
              orderType,
              paymentType,
              paymentMethod,
              discount,
              orderTotal,
            } = order;

            await Promise.all(
              products.map(async product => {
                const { net, count } = product;

                if (
                  orderType === 'Delivery' &&
                  product.actualPrice === undefined
                ) {
                  nonDealPayment += net;
                }

                if (
                  product.actualPrice === undefined &&
                  orderType === 'PickUp'
                ) {
                  const ourPercentage = +((percentage / 100) * net).toFixed();
                  ourProfit += ourPercentage;
                }

                if (product.actualPrice !== undefined) {
                  const priceDifference = net - product.actualPrice * count;

                  if (orderType === 'PickUp') {
                    ourProfit += priceDifference;
                  } else {
                    dealPayment += product.net;
                    ourProfit += priceDifference;
                  }
                }
              })
            );

            ourProfit -= +discount;

            if (paymentMethod === 'Debit/Credit Card') {
              if (paymentType === 'split' || paymentType === 'online') {
                serviceChargePercentage = (
                  (2.75 / 100) *
                  order.onlineAmount
                ).toFixed();
              } else {
                serviceChargePercentage = ((2.75 / 100) * orderTotal).toFixed();
              }
            }

            if (paymentMethod === 'Easypaisa') {
              if (paymentType === 'split' || paymentType === 'online') {
                serviceChargePercentage = (
                  (4 / 100) *
                  order.onlineAmount
                ).toFixed();
              } else {
                serviceChargePercentage = ((4 / 100) * orderTotal).toFixed();
              }
            }
          })
        );

        const deliveryOrders = orders.filter(
          ({ orderType }) => orderType === 'Delivery'
        );

        const deliveryCharges = deliveryOrders.reduce(
          (a, b) => a + +b.deliveryCharges,
          0
        );

        const ourPercentage = +((percentage / 100) * nonDealPayment).toFixed();
        const totalPaid =
          dealPayment + (nonDealPayment - ourPercentage - ourProfit);
        const ridersFare = deliveryOrders.reduce((a, b) => a + b.riderFare, 0);
        ourProfit +=
          ourPercentage +
          +serviceChargePercentage +
          deliveryCharges -
          ridersFare;

        return {
          deliveryCharges,
          ourPercentage,
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
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
