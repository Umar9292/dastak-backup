const Router = require('express/lib/router');
// const axios = require('axios');
// const Speakeasy = require('speakeasy');
const { hash, compare } = require('bcrypt');

const User = require('../../models/userModel');
// const Otp = require('../../models/otpModel');

const router = Router();

router.post('/signUp', async (req, res) => {
  try {
    const params = req.body;
    const { phone, password, type } = params;

    const user = await User.findOne({ phone });
    if (user) {
      return res.json({
        status: '404',
        msg: `The number you have entered is already associated with another account`,
      });
    }

    params.password = await hash(password, 10);

    const newUser = await new User(params).save();

    /* if (type === 'user') {
      const secret = Speakeasy.generateSecret({ length: 20 }).base32;
      const otp = Speakeasy.totp({ secret, encoding: 'base32' });

      await new Otp({
        userId: newUser._id,
        phone,
        secret,
        token: otp,
      }).save();

      const msg = `Your Dastak code is ${otp}`;
      await axios.get(`${process.env.SMS_URL}&mobile=${phone}&message=${msg}`);
    } */

    return res.json({
      status: '200',
      data: newUser,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

router.post('/signIn', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
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

    if (!(user.type === 'admin')) {
      user.playerId = '';
      await user.save();
    }

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

module.exports = router;
