const Router = require('express/lib/router');
const axios = require('axios');
const Speakeasy = require('speakeasy');

const Otp = require('../../models/otpModel');

const router = Router();

router.post('/easyPaisaOtp', async (req, res) => {
  try {
    const { phone } = req.body;

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

router.post('/verifyEasypaisaOtp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const doc = await Otp.findOne({ phone, otp }).select('secret');

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

    res.json({ status: '200' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
