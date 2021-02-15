const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Orders = require('../../../models/ordersModel');

const router = Router();

router.get('/allOrders', async (_req, res) => {
  try {
    const today = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const [upcoming, accepted, picked, totalOrders] = await Promise.all([
      Orders.find({ status: 'Pending' })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({
        status: { $in: ['Admin Accepted', 'Rider Accepted'] },
      })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({ status: 'Rider Picked Up' })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.countDocuments({
        date: today,
        status: { $ne: 'Rejected' },
      }).lean(),
    ]);

    return res.json({
      status: '200',
      upcoming,
      accepted,
      picked,
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
    const { startDate, endDate } = req.body;

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
    const { orderId, products, orderType } = req.body;

    if (products) {
      req.body.products = JSON.parse(products);
    }

    if (orderType === 'Delivery') {
      req.body.deliveryCharges = '30';
      const order = await Orders.findById(orderId).select('orderTotal');
      order.orderTotal += 30;
      order.save();
    }

    await Orders.findByIdAndUpdate(orderId, { $set: req.body });

    return res.json({ status: '200', msg: 'Order type changed successfully' });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
