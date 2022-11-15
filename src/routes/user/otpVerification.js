const Router = require('express/lib/router');
const axios = require('axios');
const Speakeasy = require('speakeasy');
const moment = require('moment-timezone');
const crypto = require('crypto');
const { hash, compare } = require('bcrypt');

const Users = require('../../models/userModel');
const Otp = require('../../models/otpModel');
const WalletHistory = require('../../models/walletHistory');
const { notifyUser } = require('../../notificationHandler/handler');
// const VoucherSignups = require('../../models/voucherSignupCount');

const router = Router();

router.post('/signUpOtp', async (req, res) => {
  try {
    const { phone, referralCode } = req.body;

    if (referralCode !== '') {
      const refferal = await Users.findOne({ 'referral.code': referralCode })
        .select('referral')
        .lean();

      if (!refferal) {
        return res.json({
          status: '404',
          msg: 'The refferal code you entered is not correct.',
        });
      }
    }

    const user = await Users.findOne({
      phone,
      verified: true,
      deleted: false,
      type: 'user',
    })
      .select('-password -__v')
      .lean();

    if (user) {
      return res.json({
        status: '404',
        msg:
          'The phone number you entered is aleady associated with another account',
      });
    }

    const secret = Speakeasy.generateSecret({ length: 20 }).base32;
    const otp = Speakeasy.totp({ secret, encoding: 'base32' });

    const otpPhone = 92 + phone.substring(1, 11);
    const msg = `Your OTP code for Dastak app is ${otp}. For any issues, contact us at 03213345718.`;

    await Promise.all([
      axios.get(`${process.env.OTP_URL}&to=${otpPhone}&message=${msg}`),

      new Otp({ phone, secret, otp }).save(),
    ]);

    res.json({ status: '200' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: `Looks like an error occurred on our side. Kindly try again`,
      error: err.toString(),
    });
  }
});

router.post('/verifySignUpOtp', async (req, res) => {
  try {
    const { phone, otp, password, referralCode } = req.body;

    const doc = await Otp.findOne({ phone, otp })
      .select('secret')
      .lean();

    if (!doc) {
      return res.json({
        status: '404',
        msg: `Sorry you've entered the wrong verification code.`,
      });
    }

    const { secret } = doc;
    const verified = Speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: otp,
      window: 3,
    });

    if (!verified) {
      return res.json({
        status: '404',
        msg: 'Your code is no longer valid. Kindly resend the code',
      });
    }

    req.body.verified = true;
    req.body.password = await hash(password, 10);
    req.body.wallet = {
      amount: referralCode !== '' ? 50 : 0,
      isUsable: true,
    };
    req.body.referral = {
      code: crypto.randomBytes(3).toString('hex'),
      usedCount: 0,
    };

    const user = await new Users(req.body).save();

    const history = {
      type: 'Referral Reward',
      amount: 50,
      userId: user._id,
      time: moment()
        .tz('Asia/karachi')
        .format('DD-MM-YYYY hh:mm a'),
    };

    await new WalletHistory(history).save();

    res.json({
      status: '200',
      data: user,
      showVoucher: true,
      voucherMsg:
        'You have been rewarded with Rs.50 in your Dastak Wallet. Enjoy and order your favorite food now.',
    });

    if (referralCode !== '') {
      const msg =
        'Dear Dastak user you have been rewarded with Rs.50 in your Dastak Wallet as a referral code bonus. Enjoy and order your favorite food now.';

      const referrer = await Users.findOne({
        'referral.code': referralCode,
      })
        .select('playerId')
        .lean();

      const referrerWalletHistory = {
        type: 'Referral Reward',
        amount: 50,
        userId: referrer._id,
        time: moment()
          .tz('Asia/karachi')
          .format('DD-MM-YYYY hh:mm a'),
      };

      await Promise.all([
        new WalletHistory(referrerWalletHistory).save(),

        Users.updateOne(
          { _id: referrer._id },
          { $inc: { 'wallet.amount': 50, 'referral.usedCount': 1 } }
        ),

        notifyUser(msg, referrer.playerId, {}),
      ]);
    }

    /* await VoucherSignups.updateOne(
      {},
      { $inc: { signupCount: 1, totalAmount: 100 } }
    ); */
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

router.post('/signIn', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await Users.findOne({ phone, deleted: false });
    if (!user) {
      return res.json({
        status: '404',
        msg: `The number you have entered is not associated with any account`,
      });
    }

    if (user.status === 'inactive') {
      return res.json({
        status: '404',
        msg: `You account has been temporarily blocked. Kindly contact support@dastak.store for more details.`,
      });
    }

    if (user.type === 'rider' && user.password !== password) {
      return res.json({
        status: '404',
        msg: `Number or password is invalid`,
      });
    }

    if (user.type !== 'rider') {
      const result = await compare(password, user.password);
      if (!result) {
        return res.json({
          status: '404',
          msg: `Number or password is invalid`,
        });
      }
    }

    user.playerId = '';
    await user.save();

    user.password = null;

    return res.json({
      status: '200',
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

router.post('/signOut', async (req, res) => {
  try {
    Users.findByIdAndUpdate(req.body.userId, { playerId: '' });

    res.json({ status: '200' });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

module.exports = router;
