const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

const User = require('../../models/userModel');
const Otp = require('../../models/otpModel');
const { emailOtp } = require('../../emailHandler/otpEmail/otpEmail');

router.post('/editProfile', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.userId,
      { $set: req.body },
      { new: true }
    ).select('-password -__v');

    return res.json({
      status: '200',
      data: user,
    });
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

  const user = await User.findById(userId);
  if (!user)
    return res.json({
      status: '404',
      msg: 'User not found',
    });

  const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (oldPasswordMatch === false)
    return res.json({
      status: '404',
      msg: 'Invalid Old password',
    });

  const newPasswordMatch = await bcrypt.compare(newPassword, user.password);
  if (newPasswordMatch === true)
    return res.json({
      status: '404',
      msg: 'You can not set the previous password again',
    });

  const hashNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashNewPassword;

  await user.save();

  return res.json({
    status: '200',
    msg: 'Your password is updated successfully',
  });
});

router.post('/sendOtp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        status: '404',
        msg: 'The email you entered is not associated with any account',
      });
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });

    await new Otp({
      userId: user._id,
      email,
      secret: secret.base32,
      token,
    }).save();

    emailOtp(user.email, token);

    res.json({
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
    const { email, token } = req.body;

    const otp = await Otp.findOne({ email, token });

    if (!otp) {
      return res.json({
        status: '404',
        msg: `Sorry you've entered the wrong verification code.`,
      });
    }

    const verification = speakeasy.totp.verify({
      secret: otp.secret,
      encoding: 'base32',
      token,
      window: 300,
    });

    if (verification === true) return res.json({ status: '200' });

    return res.json({
      status: '404',
      msg: 'Your code is no longer valid. Kindly resend the code',
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

router.post('/forgotPassword', async (req, res) => {
  try {
    const { newPassword, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        status: '404',
        msg: 'There was no user found with that email',
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    return res.json({
      status: '200',
      msg: 'Password successfully updated.',
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: 'Looks like something went wrong on our side. Kindly try again',
    });
  }
});

module.exports = router;
