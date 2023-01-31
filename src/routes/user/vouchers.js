const Router = require('express/lib/router');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Vouchers = require('../../models/vouchersModel');
const RandomVouchers = require('../../models/randomVouchers');

const router = Router();

router.post('/getUserVouchers', async (req, res) => {
  try {
    const { userId } = req.body;

    const currentDate = moment().tz('Asia/Karachi');

    const user = await Vouchers.findOne({ userId }).lean();
    if (!user) {
      return res.json({
        status: '404',
        msg: 'Dear Dastak user you dont have any vouchers yet.',
      });
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
    const { userId, voucherCode, totalAmount } = req.body;

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
      const randomVoucher = await RandomVouchers.findOne({
        voucherCode,
        used: false,
      });

      if (!randomVoucher) {
        return res.json({
          status: '404',
          msg: 'Please enter a valid voucher.',
        });
      }

      const { minimumAmount } = randomVoucher;
      if (totalAmount < minimumAmount) {
        return res.json({
          status: '404',
          msg: `Order amount must be greater than ${minimumAmount}`,
        });
      }

      randomVoucher.used = true;
      await randomVoucher.save();

      return res.json({ status: '200', amount: randomVoucher.amount });
    }

    const { minimumAmount } = user.vouchers[0];
    if (totalAmount < minimumAmount) {
      return res.json({
        status: '404',
        msg: `Order amount must be greater than Rs: ${minimumAmount}`,
      });
    }

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
