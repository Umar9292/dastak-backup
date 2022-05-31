const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Users = require('../../models/userModel');

const { notifyRiders } = require('../../notificationHandler/handler');

exports.shiftEndChecker = async () => {
  const riders = await Users.find({ type: 'rider', available: true }).select(
    'name playerId startShift endShift'
  );

  const currentTime = moment().tz('Asia/Karachi');
  const hour = moment(currentTime).format('H');

  if (riders.length > 0) {
    riders.map(async rider => {
      let { name, playerId, endShift } = rider;

      endShift = moment(endShift, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');

      if (+hour <= 3) {
        endShift = moment(endShift).add(1, 'days');
      }

      if (currentTime.isAfter(endShift)) {
        const msg = 'Your shift has ended.';
        notifyRiders(name, msg, playerId, {});

        rider.startShift = '';
        rider.endShift = '';
        rider.available = false;
        rider.status = 'idle';
        await rider.save();
      }
    });
  }
};
