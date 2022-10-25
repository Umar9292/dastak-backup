const router = require('express/lib/router')();

const Users = require('../../models/userModel');
const WalletHistory = require('../../models/walletHistory');

router.post('/v1/getWallet', async (req, res) => {
  try {
    const { userId } = req.body;

    const [{ wallet }, history] = await Promise.all([
      Users.findById(userId)
        .select('wallet')
        .lean(),

      WalletHistory.find({ userId })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return res.json({ status: '200', wallet, history, topUp: true });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
