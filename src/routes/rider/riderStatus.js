const Router = require('express/lib/router');

const Users = require('../../models/userModel');

const router = Router();

router.post('/checkStatus', async (req, res) => {
  try {
    const { riderId } = req.body;

    const { status } = await Users.findById(riderId)
      .select('status')
      .lean();

    res.json({ msg: `Your current status is ${status}.` });
  } catch (err) {
    console.log(err);
    return res.json({
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
