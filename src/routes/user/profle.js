const Router = require('express/lib/router');
const axios = require('axios');
const Speakeasy = require('speakeasy');
const moment = require('moment-timezone');
const { compare, hash } = require('bcrypt');

const Users = require('../../models/userModel');
const Otp = require('../../models/otpModel');
const { emailOtp } = require('../../emailHandler/otpEmail/otpEmail');
const ordersModel = require('../../models/ordersModel');

const router = Router();

router.post('/editProfile', async (req, res) => {
  try {
    const { userId, type, pendingCollection } = req.body;
    let user;

    if (type === 'admin') {
      user = await Users.findByIdAndUpdate(
        userId,
        { $set: req.body },
        { new: true }
      ).select('-password -__v');
    } else {
      user = await Users.findByIdAndUpdate(
        userId,
        { $set: req.body },
        { new: true }
      ).select('-password -__v');
    }

    res.json({
      status: '200',
      data: user,
    });

    const date = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    if (pendingCollection !== undefined) {
      await ordersModel.updateMany(
        { riderId: userId, date },
        { collectionSubmitted: true }
      );
    }
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

router.post('/changePassword', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  const user = await Users.findById(userId);
  if (!user)
    return res.json({
      status: '404',
      msg: 'User not found',
    });

  const oldPasswordMatch = await compare(oldPassword, user.password);
  if (!oldPasswordMatch)
    return res.json({
      status: '404',
      msg: 'Invalid old password',
    });

  const newPasswordMatch = await compare(newPassword, user.password);
  if (newPasswordMatch)
    return res.json({
      status: '404',
      msg: 'You can not set the previous password again',
    });

  const hashNewPassword = await hash(newPassword, 10);
  user.password = hashNewPassword;

  await user.save();

  return res.json({
    status: '200',
    msg: 'Your password is updated successfully',
  });
});

router.post('/sendOtp', async (req, res) => {
  try {
    const { email, phone } = req.body;
    let user;

    if (email !== '') {
      user = await Users.findOne({ email });
    } else {
      user = await Users.findOne({ phone });
    }

    if (!user) {
      return res.json({
        status: '404',
        msg:
          'The email or phone you entered is not associated with any account',
      });
    }

    const secret = Speakeasy.generateSecret({ length: 20 }).base32;
    const token = Speakeasy.totp({ secret, encoding: 'base32' });

    await new Otp({
      userId: user._id,
      email,
      secret,
      token,
    }).save();

    if (email !== '') {
      emailOtp(user.email, token);
    } else {
      const msg = `Your Dastak code is ${token}`;
      await axios.get(`${process.env.SMS_URL}&mobile=${phone}&message=${msg}`);
    }

    return res.json({
      status: '200',
      msg: `A verification code has been sent to ${user.email}.`,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like an error occurred on our side. Kindly try again`,
      error: err.toString(),
    });
  }
});

router.post('/validateOtp', async (req, res) => {
  try {
    const { email, phone, token } = req.body;
    let otp;

    if (email !== '') {
      otp = await Otp.findOne({ email, token }).select('secret');
    } else {
      otp = await Otp.findOne({ phone, token }).select('secret');
    }

    if (!otp) {
      return res.json({
        status: '404',
        msg: `Sorry you've entered the wrong verification code.`,
      });
    }

    const verified = Speakeasy.totp.verify({
      secret: otp.secret,
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

    return res.json({ status: '200' });
  } catch (err) {
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

router.post('/forgotPassword', async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await Users.findOne({ email });
  if (!user) {
    return res.json({
      status: '404',
      msg: 'User not found',
    });
  }

  const hashNewPassword = await hash(newPassword, 10);
  user.password = hashNewPassword;

  await user.save();

  return res.json({
    status: '200',
    msg: 'Your password is updated successfully',
  });
});

module.exports = router;
