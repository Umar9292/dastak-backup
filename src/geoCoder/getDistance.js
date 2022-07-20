const { getPreciseDistance } = require('geolib');

exports.getDistance = async (
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

  return distance;
};
