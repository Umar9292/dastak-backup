const Router = require('express/lib/router');
const axios = require('axios');
const Speakeasy = require('speakeasy');

const Users = require('../../models/userModel');
const Otp = require('../../models/otpModel');
const { emailOtp } = require('../../emailHandler/otpEmail/otpEmail');

const router = Router();

router.post('/sendVerificationOtp', async (req, res) => {
  try {
    const { email, phone } = req.body;

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
    const { data } = await axios.get(
      `${process.env.SMS_URL}&To=${phone}&Message=${msg}`
    );

    console.log(data);

    await new Otp({
      phone,
      email,
      secret,
      token,
    }).save();

    if (
      data === 'Promotional message is blocked as per customer instructions.'
    ) {
      const user = await Users.findOne({ email, verified: true });
      if (user) {
        return res.json({
          status: '404',
          msg:
            'The email you entered is aleady associated with another account',
        });
      }

      emailOtp(email, token);

      return res.json({
        status: '200',
        msg: `A verification code has been sent to your email.`,
      });
    }

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

module.exports = router;
