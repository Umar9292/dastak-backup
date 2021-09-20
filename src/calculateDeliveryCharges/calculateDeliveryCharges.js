const axios = require('axios');

exports.calculateDeliveryCharges = async (
  userLatitude,
  userLongitude,
  martLatitude,
  martLongitude
) => {
  const { data: distanceData } = await axios.get(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${+userLatitude},${+userLongitude}&destinations=${+martLatitude},${+martLongitude}&key=${
      process.env.GOOGLE_API_KEY
    }`
  );

  const distance = distanceData.rows[0].elements[0].distance.text.substring(
    0,
    3
  );

  let deliveryCharges = 0;

  if (distance.includes('m')) {
    deliveryCharges = 20;
  }

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
