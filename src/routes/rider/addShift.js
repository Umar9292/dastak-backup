const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Users = require('../../models/userModel');

const router = Router();

router.post('/addShift', async (req, res) => {
  try {
    const { riderId, startShift, endShift } = req.body;

    const currentTime = moment().tz('Asia/karachi');

    const start = moment(startShift, 'HH:mm:ssa').tz('Asia/karachi');
    const end = moment(endShift, 'HH:mm:ssa').tz('Asia/karachi');

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

    res.json({ status: '200', rider, msg: 'Shif added.' });
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
