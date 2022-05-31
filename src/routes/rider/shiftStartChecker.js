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
  const hour = moment(currentTime).format('H');

  if (riders.length > 0) {
    riders.map(async rider => {
      let { name, playerId, startShift, endShift } = rider;

      startShift = moment(startShift, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');

      endShift = moment(endShift, 'HH:mm')
        .tz('Asia/Karachi')
        .subtract(5, 'hours');

      console.log(startShift, endShift);

      if (+hour <= 3) {
        startShift = moment(startShift).add(1, 'days');
        endShift = moment(endShift).add(1, 'days');
      }

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
