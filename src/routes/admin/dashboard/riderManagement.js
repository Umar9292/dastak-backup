const Router = require('express/lib/router');

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

module.exports = router;
