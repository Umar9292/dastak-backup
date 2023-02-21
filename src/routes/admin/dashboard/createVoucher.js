const Router = require('express/lib/router');

const Users = require('../../../models/userModel');
const Vouchers = require('../../../models/vouchersModel');

const { notifyUser } = require('../../../notificationHandler/handler');

const router = Router();

router.post('/createVoucher', async (req, res) => {
  try {
    const { userId } = req.body;

    const [{ playerId, name }] = await Promise.all([
      Users.findById(userId)
        .select('playerId name')
        .lean(),

      Vouchers.updateOne({ userId }, { $push: { vouchers: req.body } }),
    ]);

    const msg = `Congratulations ${name}! As an extra-special thank you for being a loyal customer, here’s Rs ${req.bod.amount} voucher from us. Use it towards any of your order.`;

    notifyUser(msg, playerId, { flag: 'voucher' });

    return res.json({ status: '200', msg: 'Voucher is successfully created' });
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
