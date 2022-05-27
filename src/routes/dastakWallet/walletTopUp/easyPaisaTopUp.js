const router = require('express/lib/router')();
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const { emitEPResponse } = require('../../../../server');

const Users = require('../../../models/userModel');
const WalletHistory = require('../../../models/walletHistory');

const easyPaisaTopUp = async (amount, easyPaisaPhone, email, userId) => {
  const transactionId = `EPTO${moment()
    .tz('Asia/Karachi')
    .format('YYYYMMDD')}${crypto.randomBytes(2).toString('hex')}`;

  const data = {
    orderId: transactionId,
    storeId: process.env.EASYPAISA_STOREID,
    transactionAmount: amount,
    transactionType: 'MA',
    mobileAccountNo: easyPaisaPhone,
    emailAddress: email,
  };

  const result = await axios.post(process.env.EASYPAISA_PROD_URL, data, {
    headers: {
      Credentials: process.env.EASYPAISA_CREDENTIALS,
    },
  });

  const { responseCode } = result.data;

  console.log(responseCode);

  if (responseCode === '0001') {
    const msg =
      'Dear customer seems like you have cancelled the payment request.';
    return emitEPResponse('paymentCancelled', { msg, userId });
  }

  if (responseCode === '0002') {
    const msg = 'Dear customer the phone number you have entered is incorrect.';
    return emitEPResponse('incorrectNumber', { msg, userId });
  }

  if (responseCode === '0013') {
    const msg =
      'Dear customer your tranasction could not be completed because you dont have sufficient balance in your account right now.';
    return emitEPResponse('insufficientBalance', { msg, userId });
  }

  if (responseCode === '0000') {
    const successMsg = `Dear Dastak user amount of RS ${amount} has been added to your dastak wallet.`;
    emitEPResponse('paymentSuccessful', { successMsg, userId });

    const topUp = {
      type: 'Top Up',
      amount,
      userId,
      easyPaisaPhone,
      transactionId,
      topUpMethod: 'EasyPaisa',
      time: moment()
        .tz('Asia/karachi')
        .format('MM-DD-YYYY hh:mm a'),
    };

    await Promise.all([
      Users.findByIdAndUpdate(userId, {
        $inc: { 'wallet.amount': amount },
      }),

      new WalletHistory(topUp).save(),
    ]);
  }

  const msg = 'System error. Kindly try again.';
  return emitEPResponse('systemError', msg);
};

router.post('/v1/easyPaisaTopUp', async (req, res) => {
  try {
    const { amount, easyPaisaPhone, email, userId } = req.body;

    res.json({ status: '200', msg: 'Your payment is being processed.' });

    easyPaisaTopUp(amount, easyPaisaPhone, email, userId);
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
