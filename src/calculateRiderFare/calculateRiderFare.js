require('dotenv').config();
const { getPreciseDistance } = require('geolib');

const OrderFares = require('../models/orderFaresModel');

exports.calculateRiderFare = async (
  city,
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

  const { riderFares } = await OrderFares.findOne({ city })
    .select('riderFares')
    .lean();

  if (distance <= 0.8) {
    riderFare = Object.values(riderFares)[0];
  }

  if (distance > 0.8 && distance <= 1.7) {
    riderFare = Object.values(riderFares)[2];
  }

  if (distance > 1.7 && distance <= 2.6) {
    riderFare = Object.values(riderFares)[3];
  }

  if (distance > 2.6 && distance <= 3.5) {
    riderFare = Object.values(riderFares)[4];
  }

  if (distance > 3.5 && distance <= 4.4) {
    riderFare = Object.values(riderFares)[5];
  }

  if (distance > 4.4 && distance <= 5.3) {
    riderFare = Object.values(riderFares)[6];
  }

  if (distance > 5.3) {
    riderFare = Object.values(riderFares)[7];
  }

  return riderFare;
};
