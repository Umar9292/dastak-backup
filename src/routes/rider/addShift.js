const Router = require('express/lib/router');

const Users = require('../../models/userModel');

const router = Router();

router.post('/addShift', async (req, res) => {
  try {
    const { riderId } = req.body;

    const rider = await Users.findByIdAndUpdate(riderId, req.body, {
      new: true,
    });

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
