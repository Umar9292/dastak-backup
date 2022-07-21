const moment = require('moment-timezone');

exports.openRestaurantsForPickup = async restaurants => {
  const currentTime = moment().tz('Asia/Karachi');
  let openRestaurants = [];

  await Promise.all(
    restaurants.map(async restaurant => {
      const restaurantOpening = moment(restaurant.openingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');
      let restaurantClosing = moment(restaurant.closingTime, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');

      const openingTimeOffSet = moment(restaurantOpening).format('a');
      const closingTimeOffSet = moment(restaurantClosing).format('a');

      if (
        (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') ||
        (openingTimeOffSet === 'am' && closingTimeOffSet === 'am')
      ) {
        restaurantClosing = moment(restaurantClosing).add(1, 'days');
      }

      if (
        currentTime.isSameOrAfter(restaurantOpening) &&
        currentTime.isBefore(restaurantClosing)
      ) {
        openRestaurants = [...openRestaurants, restaurant];
      }
    })
  );

  return openRestaurants;
};
