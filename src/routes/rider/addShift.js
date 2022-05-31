const Router = require('express/lib/router');
const { add } = require('lodash');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Users = require('../../models/userModel');

const router = Router();

router.post('/addShift', async (req, res) => {
  try {
    const { riderId, startShift, endShift } = req.body;

    const {
      startShift: shiftStartTime,
      endShift: shiftEndTime,
    } = await Users.findById(riderId)
      .select('startShift endShift')
      .lean();

    if (shiftStartTime !== '' && shiftEndTime !== '') {
      return res.json({ status: '404', msg: 'You already have a shift.' });
    }

    const currentTime = moment()
      .tz('Asia/Karachi')
      .add(9, 'hours');

    console.log(currentTime, startShift, endShift);

    const start = moment(startShift, 'HH:mm')
      .tz('Asia/Karachi')
      .add(1, 'days')
      .subtract(5, 'hours');
    const end = moment(endShift, 'HH:mm').tz('Asia/Karachi');
    add(1, 'days').subtract(5, 'hours');

    console.log(start, end);

    const rider = await Users.findByIdAndUpdate(
      riderId,
      {
        startShift,
        endShift,
        available: !!(
          currentTime.isSameOrAfter(start) && currentTime.isSameOrBefore(end)
        ),
      },
      {
        new: true,
      }
    );

    res.json({ status: '200', rider, msg: 'Shift added.' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
