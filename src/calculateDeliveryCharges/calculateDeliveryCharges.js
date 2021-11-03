require('dotenv').config();
const axios = require('axios');

const calculateDeliveryCharges = async (
  userLatitude,
  userLongitude,
  martLatitude,
  martLongitude
) => {
  const result = await axios.get(
    `https://us1.locationiq.com/v1/matrix/driving/${userLongitude},${userLatitude};${martLongitude},${martLatitude}?annotations=distance&key=${process.env.LOCATION_IQ_KEY}`
  );

  const distance = result.data.distances[0][1].toFixed(1);
  console.log(distance);

  let deliveryCharges = 0;

  if (+distance <= 1) {
    deliveryCharges = 20;
  }

  if (+distance > 1 && +distance <= 2) {
    deliveryCharges = 30;
  }

  if (+distance > 2 && +distance <= 4) {
    deliveryCharges = 40;
  }

  if (+distance > 4) {
    deliveryCharges = 50;
  }

  return deliveryCharges;
};

calculateDeliveryCharges(
  32.07546878829667,
  72.67687864601612,
  32.03429060235852,
  72.70534627139568
);
