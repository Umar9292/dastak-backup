const Router = require('express/lib/router');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Vouchers = require('../../models/vouchersModel');

const router = Router();

router.post('/checkVoucher', async (req, res) => {
  try {
    const { voucherCode } = req.body;
    console.log(req.body);

    const voucher = await Vouchers.findOne({ voucherCode });
    if (!voucher) {
      return res.json({ status: '404', msg: 'Please enter a valid voucher.' });
    }

    const currentDate = moment().tz('Asia/Karachi');
    const voucherExpiry = moment(voucher.expiry, 'DD:MM:YYYY').tz(
      'Asia/Karachi'
    );

    if (voucher.used || currentDate.isAfter(voucherExpiry)) {
      return res.json({
        status: '404',
        msg: 'Please enter a valid voucher.',
      });
    }

    voucher.used = true;
    await voucher.save();

    return res.json({ status: '200', amount: voucher.amount });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
