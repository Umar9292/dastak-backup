const Router = require('express/lib/router');
const axios = require('axios');
const crypto = require('crypto');

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

router.post('/v1/card', async (req, res) => {
  try {
    const { amount } = req.body;

    const randomString = crypto.randomBytes(6).toString('hex');

    const handShakeString = `HS_ChannelId=${ALFA_CHANNEL_ID}&HS_MerchantId=${ALFA_MERCHANT_ID}&HS_StoreId=${ALFA_STORE_ID}&HS_MerchantHash=${ALFA_MERCHANT_HASH}&HS_MerchantUsername=${ALFA_MERCHANT_USERNAME}&HS_MerchantPassword=${ALFA_MERCHANT_PASSWORD}&HS_ReturnURL=${ALFA_RETURN_URL}&HS_IsRedirectionRequest=0&HS_TransactionReferenceNumber=${randomString}`;
    console.log(handShakeString);

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
      HS_TransactionReferenceNumber: randomString,
    };

    const result = await axios.post(ALFA_HANDSHAKE_URL, handShakeData);
    const { AuthToken } = result.data;

    const redirectionString = `AuthToken=${AuthToken}&ChannelId=${ALFA_CHANNEL_ID}&Currency=PKR&IsBIN=0&ReturnURL=${ALFA_RETURN_URL}&MerchantId=${ALFA_MERCHANT_ID}&StoreId=${ALFA_STORE_ID}&MerchantHash=${ALFA_MERCHANT_HASH}&MerchantUsername=${ALFA_MERCHANT_USERNAME}&MerchantPassword=${ALFA_MERCHANT_PASSWORD}&TransactionTypeId=3&TransactionReferenceNumber=${randomString}&TransactionAmount=${amount}`;

    const cipher = crypto.createCipheriv('AES-128-CBC', ALFA_KEY_1, ALFA_KEY_2);
    const redirectionHash =
      cipher.update(redirectionString, 'utf8', 'base64') +
      cipher.final('base64');

    return res.json({
      status: '200',
      randomString,
      redirectionHash,
      AuthToken,
    });
  } catch (err) {
    console.log(err);
    return res.json({ status: '404' });
  }
});

router.get('/alfaCallback', async (req, res) => {
  console.log(req.query);

  return res.redirect('https://onelink.to/zqd5vu');
});

module.exports = router;
