const Router = require('express/lib/router');
const axios = require('axios');

const router = Router();

router.post('/v1/easyPaisa', async (req, res) => {
  try {
    const { amount, phone, email } = req.body;
    // const Credentials = Buffer.from(
    //   'Dastak:7ed6bcb0da9fd70ee294c1595c037e01'
    // ).toString('base64');

    const data = {
      orderId: 'post123',
      storeId: process.env.EASYPAISA_STOREID,
      transactionAmount: amount,
      transactionType: 'MA',
      mobileAccountNo: phone,
      emailAddress: email,
    };

    const result = await axios.post(process.env.EASYPAISA_PROD_URL, data, {
      headers: {
        Credentials: process.env.EASYPAISA_CREDENTIALS,
      },
    });

    if (result.data.responseCode === '0013') {
      return res.json({
        status: '404',
        msg:
          'Dear customer your tranasction could not be completed because you dont have sufficient balance in your account right now.',
      });
    }

    if (result.data.responseCode === '0000') {
      return res.json({ status: '200' });
    }

    return res.json({ status: '404', msg: 'System error. Kindly try again.' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: 'Looks like an error occurred on our side. Kindly try again',
    });
  }
});

module.exports = router;
