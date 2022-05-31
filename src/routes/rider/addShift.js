const Router = require('express/lib/router');
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

    const currentTime = moment().tz('Asia/Karachi');
    const hour = moment(currentTime).format('H');

    let start = moment(startShift, 'HH:mm')
      .tz('Asia/Karachi')
      .subtract(5, 'hours');

    let end = moment(endShift, 'HH:mm')
      .tz('Asia/Karachi')
      .subtract(5, 'hours');

    if (+hour <= 3) {
      start = moment(start).add(1, 'days');
      end = moment(end).add(1, 'days');
    }

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
