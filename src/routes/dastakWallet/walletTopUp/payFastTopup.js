const Router = require('express/lib/router');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone');

const Users = require('../../../models/userModel');

const router = Router();

router.post('/v2/cardTopUp', async (req, res) => {
  try {
    const { userId, amount, actualAmount } = req.body;

    const transactionId = `PFTO${moment()
      .tz('Asia/Karachi')
      .format('YYYYMMDD')}${crypto.randomBytes(2).toString('hex')}`;

    const body = {
      MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
      SECURED_KEY: process.env.PAYFAST_SECURED_KEY,
      BASKET_ID: transactionId,
      TXNAMT: amount,
    };

    const { data } = await axios.post(process.env.PAYFAST_TOKEN_URL, body);

    res.json({
      status: '200',
      transactionId,
      token: data.ACCESS_TOKEN,
    });

    const topUp = {
      transactionId,
      actualAmount,
      amount,
    };

    await Users.findByIdAndUpdate(userId, { topUp });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
