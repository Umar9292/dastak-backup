const Router = require('express/lib/router');
const axios = require('axios');
const Speakeasy = require('speakeasy');

const Users = require('../../models/userModel');
const Otp = require('../../models/otpModel');

const router = Router();

router.post('/signUpOtp', async (req, res) => {
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
    const otp = Speakeasy.totp({ secret, encoding: 'base32' });

    const otpPhone = 92 + phone.substring(1, 11);
    console.log(otpPhone);
    const msg = `Your Dastak verification code is ${otp}`;
    await axios.get(`${process.env.OTP_URL}&to=${otpPhone}&message=${msg}`);

    await new Otp({ phone, secret, otp }).save();

    return res.json({ status: '200' });
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

    req.body.verified = true;
    const user = await new Users(req.body).save();

    return res.json({ status: '200', data: user });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
