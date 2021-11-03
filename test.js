// const axios = require('axios');

/* const test = async () => {
  const data = {
    pp_Language: 'EN',
    pp_MerchantID: 'MC25672',
    pp_Password: 'sxsu7z9sw1',
    pp_TxnRefNo: '50',
    pp_Amount: '10000',
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: '20211022231031',
    pp_BillReference: 'billRef',
    pp_Description: 'Description of transaction',
    pp_TxnExpiryDateTime: '20211023231031',
    pp_MobileNumber: '03123456789',
    pp_CNIC: '345678',
    pp_SecureHash:
      '95CE035F285A506B876DEC53130939C26364EA9B140C107CE7BB926F6A58F908',
  };

  const result = await axios.post(
    'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction',
    data
  );

  console.log(result.data);

  return result;
};

test(); */

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
