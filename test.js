/* eslint-disable camelcase */
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone');

const test = async () => {
  try {
    const currentDate = moment()
      .tz('Asia/Karachi')
      .format('YYYYMMDDHHmmss');

    const expiryDate = moment()
      .tz('Asia/Karachi')
      .add(1, 'days')
      .format('YYYYMMDDHHmmss');

    console.log(currentDate, expiryDate);

    const str = `2813a08s52&20000&order2&345678&Description of transactions&EN&MC25672&03123456789&sxsu7z9sw1&PKR&${currentDate}&${expiryDate}&125050`;

    const secret = '2813a08s52';
    const sha256Hasher = crypto.createHmac('sha256', secret);
    const hash = sha256Hasher.update(str).digest('hex');

    console.log(hash);

    const data = {
      pp_Amount: '20000',
      pp_BillReference: 'order2',
      pp_CNIC: '345678',
      pp_Description: 'Description of transactions',
      pp_Language: 'EN',
      pp_MerchantID: 'MC25672',
      pp_MobileNumber: '03123456789',
      pp_Password: 'sxsu7z9sw1',
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: currentDate,
      pp_TxnExpiryDateTime: expiryDate,
      pp_TxnRefNo: '125050',
      // pp_TxnType: 'mobile',
      // pp_Version: '2.0',
      pp_SecureHash: hash,
      // pp_SubMerchantID: '',
      // pp_BankID: '',
      // pp_ProductID: '',
      // ppmpf_1: '',
      // ppmpf_2: '',
      // ppmpf_3: '',
      // ppmpf_4: '',
      // ppmpf_5: '',
    };

    const result = await axios.post(
      'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction',
      data
    );

    console.log(result.data);

    return result;
  } catch (err) {
    console.log(err);
  }
};

test();

/* const refundTest = async () => {
  const data = {
    pp_TxnRefNo: '45',
    pp_Amount: '4500',
    pp_TxnCurrency: 'PKR',
    pp_MerchantID: 'MC25672',
    pp_Password: 'sxsu7z9sw1',
    pp_MerchantMPIN: '0000',
    pp_SecureHash: '2813a08s52',
  };

  const result = await axios.post(
    'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Purchase/domwalletrefundtransaction',
    data
  );

  console.log(result);

  return result;
};

refundTest(); */

/* const geolibTest = async () => {
  const result = getPreciseDistance(
    { latitude: 32.07546878829667, longitude: 72.67687864601612 },
    { latitude: 32.07939637640843, longitude: 72.67617911840925 }
  );

  console.log(result / 1000);
};

geolibTest(); */
