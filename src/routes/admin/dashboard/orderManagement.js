const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Orders = require('../../../models/ordersModel');
const Users = require('../../../models/userModel');

// const { notifyRiders } = require('../../../notificationHandler/handler');

const router = Router();

router.post('/allOrders', async (req, res) => {
  try {
    const { city, adminType, zone } = req.body;

    const today = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    let upcomingQuery;
    let acceptedQuery;
    let pickedQuery;
    let rejectedQuery;
    let totalOrdersQuery;

    if (adminType === 'super admin') {
      upcomingQuery = { status: 'Pending', city };
      pickedQuery = { status: 'Rider Picked Up', city };
      rejectedQuery = { status: 'Rejected', city, date: today };
      totalOrdersQuery = { status: { $ne: 'Rejected' }, city, date: today };
      acceptedQuery = {
        status: { $in: ['Admin Accepted', 'Rider Accepted'] },
        city,
      };
    } else {
      upcomingQuery = { status: 'Pending', zone };
      pickedQuery = { status: 'Rider Picked Up', zone };
      rejectedQuery = { status: 'Rejected', zone, date: today };
      totalOrdersQuery = { status: { $ne: 'Rejected' }, zone, date: today };
      acceptedQuery = {
        status: { $in: ['Admin Accepted', 'Rider Accepted'] },
        zone,
      };
    }

    const [
      upcoming,
      accepted,
      picked,
      rejected,
      totalOrders,
    ] = await Promise.all([
      Orders.find(upcomingQuery)
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find(acceptedQuery)
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find(pickedQuery)
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find(rejectedQuery)
        .sort({ createdAt: -1 })
        .lean(),

      Orders.countDocuments(totalOrdersQuery).lean(),
    ]);

    return res.json({
      status: '200',
      upcoming,
      accepted,
      picked,
      rejected,
      totalOrders,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/ordersTillNow', async (req, res) => {
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

    const orders = await Orders.find({
      status: { $ne: 'Rejected' },
      city,
      dateForSearching: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ status: '200', data: orders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/updateOrder', async (req, res) => {
  try {
    const { orderId, actions } = req.body;

    const { actions: currentActions, martId } = await Orders.findById(orderId)
      .select('actions martId')
      .lean();

    req.body.actions = [...currentActions, actions];

    if (martId !== req.body.martId) {
      const today = moment()
        .tz('Asia/Karachi')
        .format('DD-MM-YYYY');

      const newRestaurantsOrderCount = await Orders.countDocuments({
        martId: req.body.martId,
        today,
      });

      req.body.orderNum = newRestaurantsOrderCount + 1;
    }

    await Orders.findByIdAndUpdate(orderId, { $set: req.body });

    return res.json({ status: '200', msg: 'Order type changed successfully' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/updateRiderFare', async (req, res) => {
  try {
    const { orderId, riderFare, actions } = req.body;

    await Orders.findByIdAndUpdate(orderId, { riderFare, $push: { actions } });

    return res.json({ status: '200', msg: 'Rider fare updated successfully' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/reOpenOrder', async (req, res) => {
  try {
    const { orderId, actions } = req.body;

    const order = await Orders.findById(orderId).select(
      'status riderId reason userId actions'
    );

    if (order.riderId) {
      order.status = 'Rider Accepted';

      await Users.findByIdAndUpdate(order.riderId, {
        $inc: { orderCount: 1 },
        status: 'on delivery',
      });
    } else {
      order.status = 'Admin Accepted';
    }

    order.reason = '';
    order.actions = [...order.actions, actions];
    await order.save();

    return res.json({ status: '200', msg: 'Order reopened' });
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
