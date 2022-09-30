const axios = require('axios');
const moment = require('moment-timezone');

const Orders = require('../../models/ordersModel');

const { ALFA_IPN_URL, ALFA_RETURN_URL } = process.env;

exports.cardPaymentChecker = async () => {
  const date = moment()
    .tz('Asia/Karachi')
    .format('DD-MM-YYYY');

  const cardPaymentOrders = await Orders.find({
    status: 'Pending',
    paymentMethod: 'Debit/Credit Card',
    martName: undefined,
    date,
  })
    .select('transactionId')
    .lean();

  if (cardPaymentOrders.length > 0) {
    cardPaymentOrders.map(async order => {
      const { transactionId } = order;

      let result = await axios.get(`${ALFA_IPN_URL}/${transactionId}`);
      result = JSON.parse(result.data);
      const { ResponseCode, TransactionStatus } = result;

      if (ResponseCode === '00' && TransactionStatus === 'Paid') {
        await axios.get(`${ALFA_RETURN_URL}?TS=P&O=${transactionId}`);
      }
    });
  }
};
