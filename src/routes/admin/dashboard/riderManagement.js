const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../../models/userModel');
const Orders = require('../../../models/ordersModel');
const { notifyRiders } = require('../../../notificationHandler/handler');

const router = Router();

router.post('/allRiders', async (req, res) => {
  try {
    const { city } = req.body;

    const riders = await Users.find({
      city,
      status: { $eq: 'inactive' },
      type: 'rider',
      $or: [
        { pendingCollection: { $gt: 0 } },
        { unpaidCollection: { $gt: 0 } },
      ],
    })
      .sort({ pendingCollection: -1 })
      .lean();

    const totalCollection = riders.reduce((a, b) => a + b.pendingCollection, 0);
    const unpaidCollection = riders.reduce((a, b) => a + b.unpaidCollection, 0);

    return res.json({
      status: '200',
      totalCollection,
      riders,
      unpaidCollection,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/activeRiders', async (req, res) => {
  try {
    const { city } = req.body;

    const activeRiders = await Users.find({
      type: 'rider',
      status: { $ne: 'inactive' },
      available: true,
      city,
    })
      .sort({ name: 1 })
      .lean();

    await Promise.all(
      activeRiders.map(async rider => {
        const activeOrders = await Orders.countDocuments({
          riderId: rider._id,
          status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
        });

        rider.activeOrders = activeOrders;
      })
    );

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

router.post('/manageRiders', async (req, res) => {
  try {
    const { city } = req.body;

    const [activeRiders, inactiveRiders] = await Promise.all([
      Users.find({ type: 'rider', status: { $ne: 'inactive' }, city })
        .sort({ available: -1 })
        .lean(),

      Users.find({ type: 'rider', status: 'inactive', city })
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

    const {
      status: newRidersStatus,
      orderCount: newRidersOrderCount,
      nightFare,
      tillNoonFare,
      lateNightFare,
    } = await Users.findById(riderId)
      .select('status orderCount tillNoonFare nightFare lateNightFare')
      .lean();

    const currentTime = moment().tz('Asia/karachi');

    const morningFareTime = moment('04:00', 'HH:mm').tz('Asia/karachi');
    const noonFareTime = moment('16:00', 'HH:mm').tz('Asia/karachi');
    const lateNightFareTime = moment('19:00', 'HH:mm').tz('Asia/karachi');

    if (currentTime.isBetween(morningFareTime, noonFareTime)) {
      req.body.riderFare = tillNoonFare;
    } else if (currentTime.isBetween(noonFareTime, lateNightFareTime)) {
      req.body.riderFare = nightFare;
    } else {
      req.body.riderFare = lateNightFare;
    }

    const {
      riderId: currentlyAssignedRidersId,
      status: ordersCurrentStatus,
    } = await Orders.findByIdAndUpdate(orderId, {
      $set: req.body,
    });

    const [
      currentRidersOrders,
      { orderCount: currentRidersOrderCount },
    ] = await Promise.all([
      Orders.countDocuments({
        riderId: currentlyAssignedRidersId,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
      }),

      Users.findById(currentlyAssignedRidersId)
        .select('orderCount')
        .lean(),
    ]);

    if (currentRidersOrders === 0) {
      await Users.findByIdAndUpdate(currentlyAssignedRidersId, {
        status: 'idle',
      });
    }

    if (newRidersStatus === 'idle') {
      await Users.findByIdAndUpdate(riderId, { status: 'on delivery' });
    }

    if (ordersCurrentStatus !== 'Rejected') {
      await Users.findByIdAndUpdate(currentlyAssignedRidersId, {
        orderCount: currentRidersOrderCount - 1,
      });
    }

    await Users.findByIdAndUpdate(riderId, {
      orderCount: newRidersOrderCount + 1,
    });

    return res.json({ status: '200', msg: 'This order has been re assigned' });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/removeRider', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Orders.findByIdAndUpdate(
      { _id: orderId },
      {
        $unset: { riderId: '', riderName: '', riderPhone: '' },
        status: 'Admin Accepted',
      }
    );

    const currentRidersOrders = await Orders.countDocuments({
      riderId: order.riderId,
      status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
    });

    if (currentRidersOrders === 0) {
      await Users.findByIdAndUpdate(order.riderId, { status: 'idle' });
    }

    const rider = await Users.findById(order.riderId).select('orderCount');
    rider.orderCount -= 1;
    await rider.save();

    res.json({ status: '200', msg: 'Rider has bee removed from this order.' });

    const availableRiders = await Users.find({
      type: 'rider',
      status: 'idle',
      available: true,
      city: order.city,
    });

    const msg = `New Order from ${order.martName}`;

    availableRiders.forEach(rider =>
      notifyRiders(rider.name, rider.playerId, msg, { flag: 'riderNotified' })
    );
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/ridersFare', async (req, res) => {
  try {
    const { startDate, endDate, city } = req.body;

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
      paidToRider: false,
      city,
    });

    const data = await Promise.all(
      riders.map(async riderId => {
        const orders = await Orders.find({
          city,
          riderId,
          paidToRider: false,
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
    const totalCollection = data.reduce((a, b) => a + b.collection, 0);

    return res.json({ status: '200', data, riderEarnings, totalCollection });
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
