const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Users = require('../models/userModel');

exports.checkTime = async martId => {
  try {
    let restaurantIsOpen = false;

    const orderTime = moment().tz('Asia/karachi');

    let { openingTime, closingTime, available } = await Users.findById(
      martId
    ).select('-password -__v');

    if (!available) {
      return restaurantIsOpen;
    }

    openingTime = moment(openingTime, 'HH:mm:ssa').tz('Asia/karachi');
    closingTime = moment(closingTime, 'HH:mm:ssa').tz('Asia/karachi');

    openingTime = moment(openingTime).subtract(5, 'hours');
    closingTime = moment(closingTime).subtract(5, 'hours');

    const openingTimeOffSet = moment(openingTime).format('a');
    const closingTimeOffSet = moment(closingTime).format('a');

    if (
      (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') ||
      (openingTimeOffSet === 'am' && closingTimeOffSet === 'am')
    ) {
      closingTime = moment(closingTime).add(1, 'days');
    }

    if (
      orderTime.isBetween(
        `${openingTime.toISOString()}`,
        `${closingTime.toISOString()}`
      )
    ) {
      restaurantIsOpen = true;
    }

    return restaurantIsOpen;
  } catch (err) {
    console.log(err);
  }
};
