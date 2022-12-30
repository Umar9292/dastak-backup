const Router = require('express/lib/router');
const Speakeasy = require('speakeasy');
const moment = require('moment-timezone');
const axios = require('axios');
const { compare, hash } = require('bcrypt');

const PaymentSubmissions = require('../../models/paymentSubmitionsModel');
const Users = require('../../models/userModel');
const Otp = require('../../models/otpModel');
const ordersModel = require('../../models/ordersModel');

const router = Router();

router.post('/editProfile', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await Users.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    ).select('-password -__v');

    res.json({ status: '200', data: user });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

router.post('/editRiderCollection', async (req, res) => {
  try {
    const { userId, pendingCollection, unpaidCollection, modifier } = req.body;

    const user = await Users.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    ).select('-password -__v');

    res.json({
      status: '200',
      data: user,
    });

    if (modifier !== undefined) {
      const date = moment()
        .tz('Asia/Karachi')
        .format('DD-MM-YYYY');

      const currentTime = moment().tz('Asia/karachi');
      const formatedTime = moment(currentTime, 'hh:mm').format('hh:mm a');

      const doc = await PaymentSubmissions.findOne({
        riderId: user._id,
      });

      const submission = {
        modifier,
        date,
        time: formatedTime,
        pendingCollection:
          pendingCollection !== undefined
            ? pendingCollection
            : user.pendingCollection,
        unpaidCollection,
      };

      if (!doc) {
        await new PaymentSubmissions({
          riderId: user._id,
          riderName: user.name,
          submissions: submission,
        }).save();
      } else {
        let { submissions } = doc;
        submissions = [...submissions, submission];

        doc.submissions = submissions;
        await doc.save();
      }
    }

    if (pendingCollection !== undefined) {
      await ordersModel.updateMany(
        { riderId: userId, status: 'Delivered' },
        { collectionSubmitted: true }
      );
    }

    if (unpaidCollection !== undefined) {
      await Users.findByIdAndUpdate(userId, { unpaidCollection });
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
    const { phone } = req.body;

    const user = await Users.findOne({ phone });
    if (!user) {
      return res.json({
        status: '404',
        msg: 'The number you entered is not associated with any account',
      });
    }

    const secret = Speakeasy.generateSecret({ length: 20 }).base32;
    const otp = Speakeasy.totp({ secret, encoding: 'base32' });

    const otpPhone = 92 + phone.substring(1, 11);
    const msg = `Your OTP code for Dastak app is ${otp}. For any issues, contact us at 03213345718.`;

    await Promise.all([
      axios.get(
        `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
          msg
        )}`
      ),

      new Otp({ phone, secret, otp }).save(),
    ]);

    return res.json({
      status: '200',
      msg: `A verification code has been sent to ${phone}.`,
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
    const { phone, token } = req.body;

    const otp = await Otp.findOne({ phone, otp: token }).select('secret');
    if (!otp) {
      return res.json({
        status: '404',
        msg: `Sorry you've entered the wrong verification code.`,
      });
    }

    const { secret } = otp;
    const verified = Speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 3,
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
  const { phone, newPassword } = req.body;

  const user = await Users.findOne({ phone });
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
    msg:
      'Your password is updated successfully. Please Sign in to your account',
  });
});

module.exports = router;
