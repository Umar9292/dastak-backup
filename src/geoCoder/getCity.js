const axios = require('axios');

exports.getCity = async (lat, long) => {
  const result = await axios.get(
    `https://us1.locationiq.com/v1/reverse.php?key=${process.env.LOCATION_IQ_KEY}&lat=${lat}&lon=${long}&zoom=10&format=json`
  );

  return result.data.address.city;
};
