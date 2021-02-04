const Router = require('express/lib/router');
const { compare, hash } = require('bcrypt');
const Speakeasy = require('speakeasy');

const Users = require('../../models/userModel');
const Marts = require('../../models/martsModel');
const Otp = require('../../models/otpModel');
const { emailOtp } = require('../../emailHandler/otpEmail/otpEmail');

const router = Router();

router.post('/editProfile', async (req, res) => {
  try {
    const { type } = req.body;
    let user;

    if (type === 'admin') {
      user = await Marts.findByIdAndUpdate(
        req.body.userId,
        { $set: req.body },
        { new: true }
      ).select('-password -__v');
    } else {
      user = await Users.findByIdAndUpdate(
        req.body.userId,
        { $set: req.body },
        { new: true }
      ).select('-password -__v');
    }

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
    const { email } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.json({
        status: '404',
        msg: 'The email you entered is not associated with any account',
      });
    }

    const secret = Speakeasy.generateSecret({ length: 20 }).base32;
    const token = Speakeasy.totp({ secret });

    await new Otp({
      userId: user._id,
      email,
      secret,
      token,
    }).save();

    emailOtp(user.email, token);

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
    const { email, token } = req.body;

    const otp = await Otp.findOne({ email, token });

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
  try {
    const { newPassword, email } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.json({
        status: '404',
        msg: 'There was no user found with that email',
      });
    }

    const hashedPassword = await hash(newPassword, 10);
    user.password = hashedPassword;
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
