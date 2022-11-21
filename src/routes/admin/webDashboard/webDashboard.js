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
      monthlyOrders,
      yearlyOrders,
      totalRestaurants,
      totalCustomers,
      totalRiders,
    ] = await Promise.all([
      Orders.find({
        status: {
          $ne: 'Rejected',
        },
        dateForSearching: { $gte: weeklyStartDate, $lte: endDate },
      }),

      Orders.find({
        status: {
          $ne: 'Rejected',
        },
        dateForSearching: { $gte: monthlyStartDate, $lte: endDate },
      }),

      Orders.find({
        status: {
          $ne: 'Rejected',
        },
        dateForSearching: { $gte: yearlyStartDate, $lte: endDate },
      }),

      Users.countDocuments({ shopType: 'restaurant', status: 'active' }),

      Orders.distinct('userId', { status: { $ne: 'Rejected' } }),

      Users.countDocuments({ type: 'rider', status: { $ne: 'Rejected' } }),
    ]);

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

    const weeklyAvgOrderAmount =
      weeklyOrders.reduce((a, b) => a + b.orderTotal, 0) / 7;

    const usersData = [
      {
        id: 1,
        title: 'No. of  customers',
        number: totalCustomers.length,
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
        number: totalCustomers.length,
        type: 'customer',
      },
    ];

    return res.json({
      status: '200',
      ordersData,
      weeklyAvgOrderAmount,
      usersData,
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
