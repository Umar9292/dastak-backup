const Router = require('express/lib/router');
const axios = require('axios');

const Users = require('../../models/userModel');

const { checkTime } = require('../../checkTime/checkTime');

const router = Router();

router.post('/v1/easyPaisa', async (req, res) => {
  try {
    const { orderTotal, easyPaisaPhone, email, martId, userId } = req.body;
    // const Credentials = Buffer.from(
    //   'Dastak:7ed6bcb0da9fd70ee294c1595c037e01'
    // ).toString('base64');

    const restaurantIsOpen = await checkTime(martId);

    if (!restaurantIsOpen) {
      return res.json({
        status: '404',
        msg:
          'Sorry, the restaurant got closed. You can still order from another restaurant.',
      });
    }

    const data = {
      orderId: 'post123',
      storeId: process.env.EASYPAISA_STOREID,
      transactionAmount: orderTotal,
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

    if (responseCode === '0002') {
      return res.json({
        status: '404',
        msg: 'Dear customer the phone number you have entered is incorrect.',
      });
    }

    if (responseCode === '0013') {
      return res.json({
        status: '404',
        msg:
          'Dear customer your tranasction could not be completed because you dont have sufficient balance in your account right now.',
      });
    }

    if (responseCode === '0001') {
      return res.json({
        status: '404',
        msg: 'Dear customer seems like you have cancelled the payment request.',
      });
    }

    if (responseCode === '0000') {
      await Users.findByIdAndUpdate(userId, { easyPaisaPhone });

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
