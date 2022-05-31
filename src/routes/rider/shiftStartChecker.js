const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Users = require('../../models/userModel');

const { notifyRiders } = require('../../notificationHandler/handler');

exports.shiftStartChecker = async () => {
  const riders = await Users.find({
    type: 'rider',
    available: false,
    status: 'idle',
    startShift: { $ne: '' },
    endShift: { $ne: '' },
  }).select('name playerId startShift endShift');

  const currentTime = moment().tz('Asia/Karachi');

  if (riders.length > 0) {
    riders.map(async rider => {
      let { name, playerId, startShift, endShift } = rider;

      startShift = moment(startShift, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');

      endShift = moment(endShift, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');

      console.log('Start shift checker', startShift, endShift);

      if (
        currentTime.isSameOrAfter(startShift) &&
        currentTime.isSameOrBefore(endShift)
      ) {
        const msg = 'Your shift has started.';
        notifyRiders(name, msg, playerId, {});

        rider.available = true;
        rider.status = 'idle';
        await rider.save();
      }
    });
  }
};
