const Router = require('express/lib/router');
const axios = require('axios');
const Speakeasy = require('speakeasy');
const { hash, compare } = require('bcrypt');

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
    const { phone, otp, password } = req.body;
    console.log(req.body);

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
    req.body.password = await hash(password, 10);
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

router.post('/signIn', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await Users.findOne({ phone });
    if (!user) {
      return res.json({
        status: '404',
        msg: `The number you have entered is not associated with any account`,
      });
    }

    if (user.status === 'inactive') {
      return res.json({
        status: '404',
        msg: `You account has been temporarily blocked. Kindly contact support@dask.store for more details.`,
      });
    }

    const result = await compare(password, user.password);
    if (!result) {
      return res.json({
        status: '404',
        msg: `Number or password is invalid`,
      });
    }

    user.playerId = '';
    await user.save();

    user.password = null;

    return res.json({
      status: '200',
      data: user,
    });
  } catch (err) {
    res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

router.post('/signOut', async (req, res) => {
  try {
    await Users.findByIdAndUpdate(req.body.userId, { playerId: '' });

    return res.json({ status: '200' });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

module.exports = router;
