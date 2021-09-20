const axios = require('axios');

exports.getAddress = async (latitude, longitude) => {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${process.env.GOOGLE_API_KEY}`
  );

  return data.results[0].formatted_address;
};
