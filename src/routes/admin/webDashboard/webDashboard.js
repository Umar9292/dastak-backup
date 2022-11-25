const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Orders = require('../../../models/ordersModel');
const Users = require('../../../models/userModel');

const router = Router();

router.get('/v1/dashboard', async (req, res) => {
  try {
    let endDate = moment().tz('Asia/Karachi');
    let weeklyStartDate = moment(endDate).subtract(7, 'days');
    let monthlyStartDate = moment(endDate).subtract(30, 'days');
    let yearlyStartDate = moment(endDate).subtract(365, 'days');

    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    weeklyStartDate = moment(weeklyStartDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    monthlyStartDate = moment(monthlyStartDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    yearlyStartDate = moment(yearlyStartDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const [
      weeklyOrders,
      weeklyOrderDates,
      monthlyOrders,
      yearlyOrders,
      totalRestaurants,
      totalCustomers,
      totalRiders,
    ] = await Promise.all([
      Orders.find({
        status: { $ne: 'Rejected' },
        dateForSearching: { $gte: weeklyStartDate, $lte: endDate },
      }).lean(),

      Orders.distinct('date', {
        status: { $ne: 'Rejected' },
        dateForSearching: { $gte: weeklyStartDate, $lte: endDate },
      }),

      Orders.find({
        status: { $ne: 'Rejected' },
        dateForSearching: { $gte: monthlyStartDate, $lte: endDate },
      }).lean(),

      Orders.find({
        status: { $ne: 'Rejected' },
        dateForSearching: { $gte: yearlyStartDate, $lte: endDate },
      }).lean(),

      Users.countDocuments({ shopType: 'restaurant', status: 'active' }),

      Users.countDocuments({ type: 'user', status: 'active' }),

      Users.countDocuments({ type: 'rider', status: { $ne: 'inactive' } }),
    ]);

    const weeklyOrderProfit = await Promise.all(
      weeklyOrderDates.map(async date => {
        let ourProfit = 0;

        const orders = await Orders.find({
          date,
          status: { $ne: 'Rejected' },
        }).lean();

        await Promise.all(
          orders.map(async order => {
            const { products, orderType, paymentMethod, discount } = order;

            let nonDealPayment = 0;
            let PFServiceChargePercentage = 0;

            const { percentage } = await Users.findById(order.martId)
              .select('percentage')
              .lean();

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
                  ourProfit += priceDifference;
                }
              })
            );

            let serviceChargesDifference = 0;
            if (paymentMethod === 'Card') {
              PFServiceChargePercentage = (
                (2.83 / 100) *
                order.onlineAmount
              ).toFixed();

              serviceChargesDifference =
                +order.serviceCharges - +PFServiceChargePercentage;
            }

            if (
              paymentMethod !== 'Card' &&
              paymentMethod !== 'COD' &&
              paymentMethod !== 'Dastak Wallet'
            ) {
              PFServiceChargePercentage = (
                (1.92 / 100) *
                order.onlineAmount
              ).toFixed();

              serviceChargesDifference =
                +order.serviceCharges - +PFServiceChargePercentage;
            }

            const ourPercentage = +(
              (percentage / 100) *
              nonDealPayment
            ).toFixed();

            let deliveryCharges = 0;
            let platformFee = 0;
            let riderFare = 0;

            if (orderType === 'Delivery') {
              deliveryCharges = order.deliveryCharges;
              platformFee = order.platformFee;
              riderFare = order.riderFare;
            }

            if (
              moment(date, 'DD-MM-YYYY')
                .tz('Asia/Karachi')
                .format('dddd') === 'Friday'
            ) {
              console.log(date, ourProfit, order._id);
            }

            ourProfit +=
              ourPercentage +
              serviceChargesDifference +
              +deliveryCharges +
              platformFee -
              riderFare -
              +discount;
          })
        );

        return {
          day: moment(date, 'DD-MM-YYYY')
            .tz('Asia/Karachi')
            .format('dddd'),
          ourProfit,
        };
      })
    );

    const ordersData = [
      {
        id: '1',
        ordersType: 'week',
        typeTitle: 'No of orders in this week',
        totalOrders: weeklyOrders.length,
        surgeDetail: '3% higher then last week ',
      },
      {
        id: '2',
        ordersType: 'month',
        typeTitle: 'No of orders in last month',
        totalOrders: monthlyOrders.length,
        surgeDetail: '5% higher then last week ',
      },
      {
        id: '3',
        ordersType: 'year',
        typeTitle: 'No of orders in last year',
        totalOrders: yearlyOrders.length,
        surgeDetail: '10% higher then last week ',
      },
    ];

    const usersData = [
      {
        id: 1,
        title: 'No. of  customers',
        number: totalCustomers,
        type: 'customer',
      },
      {
        id: 2,
        title: 'No. of riders',
        number: totalRiders,
        type: 'riders',
      },
      {
        id: 3,
        title: 'No. of satisfied customers',
        number: totalCustomers,
        type: 'customer',
      },
    ];

    const weeklyAvgOrderAmount =
      weeklyOrders.reduce((a, b) => a + b.orderTotal, 0) / weeklyOrders.length;

    return res.json({
      status: '200',
      weeklyOrderProfit,
      ordersData,
      usersData,
      weeklyAvgOrderAmount,
      totalRestaurants,
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
