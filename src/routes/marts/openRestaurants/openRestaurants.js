const moment = require('moment-timezone');

exports.openRestaurants = async restaurants => {
  const currentTime = moment().tz('Asia/Karachi');

  const openRestaurants = restaurants.filter(restaurant => {
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
      return restaurant;
    }
  });

  return openRestaurants;
};
