const Router = require('express/lib/router');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Vouchers = require('../../models/vouchersModel');

const router = Router();

router.post('/getUserVouchers', async (req, res) => {
  try {
    const { userId } = req.body;

    const currentDate = moment().tz('Asia/Karachi');

    const user = await Vouchers.findOne({ userId }).lean();
    if (!user) {
      return res.json({ status: '404' });
    }

    let { vouchers } = user;
    vouchers = vouchers.filter(voucher => {
      const voucherExpiry = moment(voucher.validTill, 'DD:MM:YYYY').tz(
        'Asia/Karachi'
      );

      if (!voucher.used && currentDate.isBefore(voucherExpiry)) {
        return voucher;
      }
    });

    return res.json({ status: '200', vouchers });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/checkVoucher', async (req, res) => {
  try {
    const { userId, voucherCode } = req.body;

    const user = await Vouchers.findOne(
      {
        userId,
        vouchers: {
          $elemMatch: {
            voucherCode,
            used: false,
          },
        },
      },
      {
        'vouchers.$': 1,
      }
    ).lean();

    if (!user) {
      return res.json({ status: '404', msg: 'Please enter a valid voucher.' });
    }

    await Vouchers.updateOne(
      {
        'vouchers.voucherCode': voucherCode,
      },
      { $set: { 'vouchers.$.used': true } }
    );

    return res.json({ status: '200', amount: user.vouchers[0].amount });
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
