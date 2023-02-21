const Router = require('express/lib/router');

const Users = require('../../../models/userModel');
const Vouchers = require('../../../models/vouchersModel');

const { notifyUser } = require('../../../notificationHandler/handler');

const router = Router();

router.post('/createVoucher', async (req, res) => {
  try {
    const { userId } = req.body;

    const usersVouchers = await Vouchers.findOne({ userId });
    if (!usersVouchers) {
      await new Vouchers({ userId, vouchers: req.body }).save();
    } else {
      await Vouchers.updateOne({ userId }, { $push: { vouchers: req.body } });
    }

    res.json({ status: '200', msg: 'Voucher is successfully created' });

    const { playerId, name } = await Users.findById(userId)
      .select('playerId name')
      .lean();

    const msg = `Congratulations ${name}! As an extra-special thank you for being a loyal customer, here’s Rs ${req.body.amount} voucher from us. Use it towards any of your order.`;
    notifyUser(msg, playerId, { flag: 'voucher' });
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
