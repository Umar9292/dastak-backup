const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../../models/userModel');
const Orders = require('../../../models/ordersModel');

const router = Router();

router.get('/allRiders', async (_req, res) => {
  try {
    const riders = await Users.find({
      type: 'rider',
      status: { $ne: 'inactive' },
      pendingCollection: { $gt: 0 },
    })
      .sort({ pendingCollection: -1 })
      .lean();

    const totalCollection = riders.reduce((a, b) => a + b.pendingCollection, 0);

    return res.json({ status: '200', totalCollection, riders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/activeRiders', async (_req, res) => {
  try {
    const activeRiders = await Users.find({
      type: 'rider',
      status: { $ne: 'inactive' },
      available: true,
    })
      .sort({ name: 1 })
      .lean();

    return res.json({ status: '200', activeRiders });
  } catch (err) {
    console.log(err);
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

router.post('/dailyRiderCollections', async (req, res) => {
  try {
    const { date } = req.body;

    const riders = await Orders.distinct('riderId', {
      date,
      paidToRider: false,
    });

    const data = await Promise.all(
      riders.map(async riderId => {
        const [orders, { pendingCollection }] = await Promise.all([
          Orders.find({
            riderId,
            date,
            status: 'Delivered',
            orderType: 'Delivery',
            paidToRider: false,
          }),

          Users.findById(riderId).select('pendingCollection'),
        ]);

        const collection = orders.reduce((a, b) => a + b.orderTotal, 0);

        return {
          riderId,
          name: orders[0].riderName,
          phone: orders[0].phone,
          collection,
          pendingCollection,
        };
      })
    );

    const totalCollection = data.reduce((a, b) => a + b.collection, 0);

    return res.json({
      totalCollection,
      data,
      status: '200',
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

router.post('/ridersFare', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const riders = await Orders.distinct('riderId', {
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
      status: 'Delivered',
      orderType: 'Delivery',
      paidToRider: true,
    });

    const data = await Promise.all(
      riders.map(async riderId => {
        const orders = await Orders.find({
          riderId,
          paidToRider: true,
          orderType: 'Delivery',
          status: 'Delivered',
          dateForSearching: {
            $gte: start,
            $lte: end,
          },
        });

        const collection = orders.reduce((a, b) => a + b.orderTotal, 0);
        const riderFare = orders.reduce((a, b) => a + b.riderFare, 0);

        return {
          _id: riderId,
          name: orders[0].riderName,
          phone: orders[0].riderPhone,
          collection,
          riderFare,
          orders,
        };
      })
    );

    const riderEarnings = data.reduce((a, b) => a + b.riderFare, 0);

    return res.json({ status: '200', data, riderEarnings });
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

    startDate = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    riders = JSON.parse(riders);

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
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
