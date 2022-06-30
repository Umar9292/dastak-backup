require('dotenv').config();
// const axios = require('axios');
const { getPreciseDistance } = require('geolib');

const OrderFares = require('../models/orderFaresModel');

exports.calculateDeliveryCharges = async (
  city,
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

  const orderFares = await OrderFares.findOne({ city })
    .select('deliveryCharges')
    .lean();

  if (distance <= 0.8) {
    deliveryCharges = Object.values(orderFares.deliveryCharges[0])[0];
  }

  if (distance > 0.8 && distance <= 1.7) {
    deliveryCharges = Object.values(orderFares.deliveryCharges[0])[1];
  }

  if (distance > 1.7 && distance <= 3.6) {
    deliveryCharges = Object.values(orderFares.deliveryCharges[0])[2];
  }

  if (distance > 3.6) {
    deliveryCharges = 60;
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
}; */
