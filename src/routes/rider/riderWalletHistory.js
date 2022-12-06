const Router = require('express/lib/router');

const RiderWalletHistory = require('../../models/riderWalletHistory');

const router = Router();

router.post('/v1/getRiderWalletHistory', async (req, res) => {
  try {
    const { riderId } = req.body;

    const history = await RiderWalletHistory.find({ riderId }).sort({
      createdAt: -1,
    });

    return res.json({ status: '200', history });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
