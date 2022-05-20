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

  if (distance <= 0.8) {
    riderFare = 50;
  }

  if (distance > 0.8 && distance <= 1.7) {
    riderFare = 60;
  }

  if (distance > 1.7 && distance <= 2.6) {
    riderFare = 70;
  }

  if (distance > 2.6 && distance <= 3.5) {
    riderFare = 75;
  }

  if (distance > 3.5 && distance <= 4.4) {
    riderFare = 80;
  }

  if (distance > 4.4 && distance <= 5.3) {
    riderFare = 90;
  }

  if (distance > 5.3) {
    riderFare = 100;
  }

  return riderFare;
};
