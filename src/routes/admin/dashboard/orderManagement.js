import Router from 'express/lib/router';

import Orders from '../../../models/ordersModel';

const router = Router();

router.get('/allOrders', async (_req, res) => {
  try {
    const [upcoming, accepted, picked] = await Promise.all([
      Orders.find({ status: 'Pending' }).sort({ createdAt: -1 }),

      Orders.find({
        status: { $in: ['Admin Accepted', 'Rider Accepted'] },
      }).sort({ createdAt: -1 }),

      Orders.find({ status: 'Rider Picked Up' }).sort({ createdAt: -1 }),
    ]);

    return res.json({
      status: '200',
      upcoming,
      accepted,
      picked,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

export default router;
