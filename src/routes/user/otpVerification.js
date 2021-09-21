const Router = require('express/lib/router');
const axios = require('axios');
const Speakeasy = require('speakeasy');

const Users = require('../../models/userModel');
const Otp = require('../../models/otpModel');

const router = Router();

router.post('/numberVerificationOtp', async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await Users.findOne({ phone, verified: true });
    if (user) {
      return res.json({
        status: '404',
        msg:
          'The phone number you entered is aleady associated with another account',
      });
    }

    const secret = Speakeasy.generateSecret({ length: 20 }).base32;
    const token = Speakeasy.totp({ secret, encoding: 'base32' });

    const msg = `Your Dastak verification code is ${token}`;
    await axios.get(`${process.env.OTP_URL}&to=${phone}&message=${msg}`);

    await new Otp({ phone, secret, token }).save();

    return res.json({
      status: '200',
      msg: `A verification code has been sent to your phone number.`,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like an error occurred on our side. Kindly try again`,
      error: err.toString(),
    });
  }
});

router.post('/validateNumberOtp', async (req, res) => {
  try {
    const { phone, token } = req.body;

    const { secret } = await Otp.findOne({ phone, token }).select('secret');

    if (!secret) {
      return res.json({
        status: '404',
        msg: `Sorry you've entered the wrong verification code.`,
      });
    }

    const verified = Speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 300,
    });

    if (!verified) {
      return res.json({
        status: '404',
        msg: 'Your code is no longer valid. Kindly resend the code',
      });
    }

    await new Users(req.body).save();

    return res.json({ status: '200' });
  } catch (err) {
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
