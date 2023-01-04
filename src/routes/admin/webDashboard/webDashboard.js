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

    console.log(new Date(weeklyStartDate), new Date(endDate));

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
      })
        .select('date time orderType orderTotal status')
        .lean(),

      Orders.aggregate([
        {
          $match: {
            status: { $ne: 'Rejected' },
            dateForSearching: {
              $gte: new Date(weeklyStartDate),
              $lte: new Date(endDate),
            },
          },
        },
        { $group: { _id: '$date', key: { $last: '$dateForSearching' } } },
        { $sort: { key: 1 } },
      ]),

      Orders.countDocuments({
        status: { $ne: 'Rejected' },
        dateForSearching: { $gte: monthlyStartDate, $lte: endDate },
      })
        .select('date time orderType orderTotal status')
        .lean(),

      Orders.countDocuments({
        status: { $ne: 'Rejected' },
        dateForSearching: { $gte: yearlyStartDate, $lte: endDate },
      })
        .select('date time orderType orderTotal status')
        .lean(),

      Users.countDocuments({ shopType: 'restaurant', status: 'active' }),

      Users.countDocuments({ type: 'user', status: 'active' }),

      Users.countDocuments({ type: 'rider', status: { $ne: 'inactive' } }),
    ]);

    const weeklyOrderProfit = await Promise.all(
      weeklyOrderDates.map(async ({ _id: date }) => {
        const result = await Orders.aggregate([
          {
            $match: {
              date,
              profit: { $ne: undefined },
              status: { $ne: 'Rejected' },
            },
          },
          { $group: { _id: '$status', ourProfit: { $sum: '$profit' } } },
        ]);

        if (result.length > 0) {
          return {
            day: moment(date, 'DD-MM-YYYY')
              .tz('Asia/Karachi')
              .format('dddd'),
            ourProfit: result[0].ourProfit,
          };
        }
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
        totalOrders: monthlyOrders,
        surgeDetail: '5% higher then last week ',
      },
      {
        id: '3',
        ordersType: 'year',
        typeTitle: 'No of orders in last year',
        totalOrders: yearlyOrders,
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
      weeklyOrders,
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
