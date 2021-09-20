const NodeGeocoder = require('node-geocoder');

exports.getCity = async (lat, long) => {
  const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GOOGLE_API_KEY,
    formatter: 'json',
  };

  const geocoder = NodeGeocoder(options);
  const res = await geocoder.reverse({ lat, lon: long });
  return res[0].city;
};
