const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../../models/userModel');
const Orders = require('../../../models/ordersModel');

const router = Router();

router.get('/activeRiders', async (_req, res) => {
  try {
    const activeRiders = await Users.find({
      type: 'rider',
      status: { $ne: 'inactive' },
      available: true,
    }).lean();

    return res.json({ status: '200', activeRiders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/allRiders', async (_req, res) => {
  try {
    const allRiders = await Users.find({ type: 'rider' })
      .sort({ name: 1 })
      .lean();

    return res.json({ status: '200', allRiders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/manageRiders', async (_req, res) => {
  try {
    const [activeRiders, inactiveRiders] = await Promise.all([
      Users.find({ type: 'rider', status: { $ne: 'inactive' } })
        .sort({ available: -1 })
        .lean(),

      Users.find({ type: 'rider', status: 'inactive' })
        .sort({ available: -1 })
        .lean(),
    ]);

    return res.json({ status: '200', activeRiders, inactiveRiders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/reAssignRider', async (req, res) => {
  try {
    const { orderId, riderId } = req.body;

    const { riderId: currentlyAssignedRider } = await Orders.findByIdAndUpdate(
      orderId,
      {
        $set: req.body,
      }
    );

    const [
      currentRidersOrders,
      { status: newRidersStatus },
    ] = await Promise.all([
      Orders.countDocuments({
        riderId: currentlyAssignedRider,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
      }),

      Users.findById(riderId),
    ]);

    if (currentRidersOrders === 0) {
      await Users.findByIdAndUpdate(currentlyAssignedRider, { status: 'idle' });
    }

    if (newRidersStatus === 'idle') {
      await Users.findByIdAndUpdate(riderId, { status: 'on delivery' });
    }

    return res.json({ status: '200', msg: 'This order has been re assigned' });
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
      status: 'Delivered',
      orderType: 'Delivery',
      paidToRider: false,
    });

    console.log(start, end);

    const data = await Promise.all(
      riders.map(async riderName => {
        const [orders, { name, phone, _id }] = await Promise.all([
          Orders.find({
            riderName,
            paidToRider: { $in: [false, undefined] },
            orderType: 'Delivery',
            status: 'Delivered',
            dateForSearching: {
              $gte: start,
              $lte: end,
            },
          }),

          Users.findOne({ name: riderName }),
        ]);

        const collection = orders.reduce((a, b) => a + b.orderTotal, 0);
        const riderFare = orders.reduce((a, b) => a + b.riderFare, 0);

        return {
          _id,
          name,
          phone,
          collection,
          riderFare,
          orders,
        };
      })
    );

    return res.json({ status: '200', data });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/paidToRiders', async (req, res) => {
  try {
    let { riders, startDate, endDate } = req.body;

    console.log(req.body);

    startDate = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    riders = JSON.parse(riders);
    console.log(riders);
    console.log(startDate, endDate);

    await Promise.all(
      riders.map(async ({ id }) => {
        await Promise.all([
          Users.findById(id),

          Orders.updateMany(
            {
              riderId: id,
              paidToRider: false,
              orderType: 'Delivery',
              status: { $in: ['Delivered', 'Rider Picked Up'] },
              dateForSearching: {
                $gte: startDate,
                $lte: endDate,
              },
            },
            { paidToRider: true }
          ),
        ]);
      })
    );

    return res.json({
      status: '200',
      msg: 'Riders have been paid successfully',
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
