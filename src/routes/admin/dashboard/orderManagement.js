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
      Orders.find({ status: 'Pending' }).sort({ createdAt: -1 }),

      Orders.find({
        status: { $in: ['Admin Accepted', 'Rider Accepted'] },
      }).sort({ createdAt: -1 }),

      Orders.find({ status: 'Rider Picked Up' }).sort({ createdAt: -1 }),

      Orders.countDocuments({ date: today, status: { $ne: 'Rejected' } }),
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

router.get('/ordersTillNow', async (_req, res) => {
  try {
    const orders = await Orders.find({ status: { $ne: 'Rejected' } })
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

router.post('/changeOrderType', async (req, res) => {
  try {
    const { orderId } = req.body;

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
