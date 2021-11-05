require('dotenv').config();
const axios = require('axios');

exports.calculateDeliveryCharges = async (
  userLatitude,
  userLongitude,
  martLatitude,
  martLongitude
) => {
  const result = await axios.get(
    `https://us1.locationiq.com/v1/matrix/driving/${userLongitude},${userLatitude};${martLongitude},${martLatitude}?annotations=distance&key=${process.env.LOCATION_IQ_KEY}`
  );

  let distance = result.data.distances[0][1] / 1000;
  distance = distance.toFixed(1);

  let deliveryCharges = 0;

  if (+distance <= 1) {
    deliveryCharges = 30;
  }

  if (+distance > 1 && +distance <= 2) {
    deliveryCharges = 35;
  }

  if (+distance > 2 && +distance <= 4) {
    deliveryCharges = 40;
  }

  if (+distance > 4) {
    deliveryCharges = 50;
  }

  return deliveryCharges;
};
