const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Orders = require('../../../models/ordersModel');
const Users = require('../../../models/userModel');

// const { notifyRiders } = require('../../../notificationHandler/handler');

const router = Router();

router.post('/allOrders', async (req, res) => {
  try {
    const { city } = req.body;

    const today = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const [
      pending,
      adminAccepted,
      pickedUp,
      todaysRejected,
      totalOrders,
    ] = await Promise.all([
      Orders.find({ status: 'Pending', city })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({
        status: { $in: ['Admin Accepted', 'Rider Accepted'] },
        city,
      })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({ status: 'Rider Picked Up', city })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({ status: 'Rejected', city, date: today })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.countDocuments({
        status: { $ne: 'Rejected' },
        city,
        date: today,
      }).lean(),
    ]);

    const [upcoming, accepted, picked, rejected] = await Promise.all([
      Promise.all(
        pending.map(async order => {
          const { martId } = order;

          const { geometry } = await Users.findById(martId)
            .select('geometry')
            .lean();

          const [longitude, latitude] = geometry.coordinates;
          order.martLatitude = latitude.toString();
          order.martLongitude = longitude.toString();
          return order;
        })
      ),

      Promise.all(
        adminAccepted.map(async order => {
          const { martId } = order;

          const { geometry } = await Users.findById(martId)
            .select('geometry')
            .lean();

          const [longitude, latitude] = geometry.coordinates;
          order.martLatitude = latitude.toString();
          order.martLongitude = longitude.toString();
          return order;
        })
      ),

      Promise.all(
        pickedUp.map(async order => {
          const { martId } = order;

          const { geometry } = await Users.findById(martId)
            .select('geometry')
            .lean();

          const [longitude, latitude] = geometry.coordinates;
          order.martLatitude = latitude.toString();
          order.martLongitude = longitude.toString();
          return order;
        })
      ),

      Promise.all(
        todaysRejected.map(async order => {
          const { martId } = order;

          const { geometry } = await Users.findById(martId)
            .select('geometry')
            .lean();

          const [longitude, latitude] = geometry.coordinates;
          order.martLatitude = latitude.toString();
          order.martLongitude = longitude.toString();
          return order;
        })
      ),
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
    const { orderId } = req.body;

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
    const { orderId } = req.body;

    await Orders.findByIdAndUpdate(orderId, { $set: req.body });

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
    const { orderId } = req.body;

    const order = await Orders.findById(orderId).select(
      'status riderId reason'
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
    await order.save();

    return res.json({ status: '200', msg: 'Order reopened' });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
