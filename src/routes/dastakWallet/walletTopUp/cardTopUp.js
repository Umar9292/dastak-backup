/* const Router = require('express/lib/router');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone');

const Users = require('../../../models/userModel');

const {
  ALFA_KEY_1,
  ALFA_KEY_2,
  ALFA_CHANNEL_ID,
  ALFA_RETURN_URL,
  ALFA_MERCHANT_ID,
  ALFA_STORE_ID,
  ALFA_MERCHANT_HASH,
  ALFA_MERCHANT_USERNAME,
  ALFA_MERCHANT_PASSWORD,
  ALFA_HANDSHAKE_URL,
} = process.env;

const router = Router();

router.post('/v1/cardTopUp', async (req, res) => {
  try {
    const { userId, amount, actualAmount } = req.body;

    const transactionId = `ATO${moment()
      .tz('Asia/Karachi')
      .format('YYYYMMDD')}${crypto.randomBytes(2).toString('hex')}`;

    const handShakeString = `HS_ChannelId=${ALFA_CHANNEL_ID}&HS_MerchantId=${ALFA_MERCHANT_ID}&HS_StoreId=${ALFA_STORE_ID}&HS_MerchantHash=${ALFA_MERCHANT_HASH}&HS_MerchantUsername=${ALFA_MERCHANT_USERNAME}&HS_MerchantPassword=${ALFA_MERCHANT_PASSWORD}&HS_ReturnURL=${ALFA_RETURN_URL}&HS_IsRedirectionRequest=0&HS_TransactionReferenceNumber=${transactionId}`;

    const handShakeCipher = crypto.createCipheriv(
      'AES-128-CBC',
      ALFA_KEY_1,
      ALFA_KEY_2
    );
    const handShakeHash =
      handShakeCipher.update(handShakeString, 'utf8', 'base64') +
      handShakeCipher.final('base64');

    const handShakeData = {
      HS_RequestHash: handShakeHash,
      HS_IsRedirectionRequest: '0',
      HS_ChannelId: ALFA_CHANNEL_ID,
      HS_ReturnURL: ALFA_RETURN_URL,
      HS_MerchantId: ALFA_MERCHANT_ID,
      HS_StoreId: ALFA_STORE_ID,
      HS_MerchantHash: ALFA_MERCHANT_HASH,
      HS_MerchantUsername: ALFA_MERCHANT_USERNAME,
      HS_MerchantPassword: ALFA_MERCHANT_PASSWORD,
      HS_TransactionReferenceNumber: transactionId,
    };

    const result = await axios.post(ALFA_HANDSHAKE_URL, handShakeData);
    const { AuthToken } = result.data;

    const redirectionString = `AuthToken=${AuthToken}&ChannelId=${ALFA_CHANNEL_ID}&Currency=PKR&IsBIN=0&ReturnURL=${ALFA_RETURN_URL}&MerchantId=${ALFA_MERCHANT_ID}&StoreId=${ALFA_STORE_ID}&MerchantHash=${ALFA_MERCHANT_HASH}&MerchantUsername=${ALFA_MERCHANT_USERNAME}&MerchantPassword=${ALFA_MERCHANT_PASSWORD}&TransactionTypeId=3&TransactionReferenceNumber=${transactionId}&TransactionAmount=${amount}`;

    const cipher = crypto.createCipheriv('AES-128-CBC', ALFA_KEY_1, ALFA_KEY_2);
    const redirectionHash =
      cipher.update(redirectionString, 'utf8', 'base64') +
      cipher.final('base64');

    res.json({
      status: '200',
      transactionId,
      redirectionHash,
      AuthToken,
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

router.post('/v1/checkCardTopUpStatus', async (req, res) => {
  try {
    const { transactionId } = req.body;

    const { topUp } = await Users.findOne({
      'topUp.transactionId': transactionId,
    })
      .select('topUp')
      .lean();

    if (topUp.status === 'Successful') {
      return res.json({
        status: '200',
        msg: `Dear Dastak user amount of RS ${topUp.actualAmount} has been added to your dastak wallet.`,
      });
    }

    let result = await axios.get(
      `${process.env.ALFA_IPN_URL}/${transactionId}`
    );

    result = JSON.parse(result.data);
    const { ResponseCode, TransactionStatus } = result;

    if (ResponseCode === '00' && TransactionStatus === 'Paid') {
      await axios.get(`${ALFA_RETURN_URL}?TS=P&O=${transactionId}`);

      return res.json({
        status: '200',
        msg: `Dear Dastak user amount of RS ${topUp.actualAmount} has been added to your dastak wallet.`,
      });
    }

    return res.json({ status: '404' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
 */
