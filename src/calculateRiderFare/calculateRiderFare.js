require('dotenv').config();
const { getPreciseDistance } = require('geolib');

exports.calculateRiderFare = async (
  orderLatitude,
  oderLongitude,
  martLatitude,
  martLongitude
) => {
  const distance =
    getPreciseDistance(
      { latitude: orderLatitude, longitude: oderLongitude },
      { latitude: martLatitude, longitude: martLongitude }
    ) / 1000;

  let riderFare = 0;

  if (distance <= 2.4) {
    riderFare = 75;
  }

  if (distance > 2.4 && distance <= 3.5) {
    riderFare = 85;
  }

  if (distance > 3.5 && distance <= 4.5) {
    riderFare = 90;
  }

  if (distance > 4.5) {
    riderFare = 100;
  }

  return riderFare;
};
