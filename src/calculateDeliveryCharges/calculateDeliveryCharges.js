require('dotenv').config();
// const axios = require('axios');
const { getPreciseDistance } = require('geolib');

exports.calculateDeliveryCharges = async (
  userLatitude,
  userLongitude,
  martLatitude,
  martLongitude
) => {
  const distance =
    getPreciseDistance(
      { latitude: userLatitude, longitude: userLongitude },
      { latitude: martLatitude, longitude: martLongitude }
    ) / 1000;

  let deliveryCharges = 0;

  if (distance <= 0.8) {
    deliveryCharges = 50;
  }

  if (distance > 0.8 && distance <= 1.7) {
    deliveryCharges = 55;
  }

  if (distance > 1.7 && distance <= 3.6) {
    deliveryCharges = 60;
  }

  if (distance > 3.6) {
    deliveryCharges = 70;
  }

  return deliveryCharges;
};

/* exports.calculateDeliveryCharges = async (
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
 */
