const Router = require('express/lib/router');

const User = require('../../models/userModel');

const router = Router();

router.post('/logout', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body.userId, { playerId: '' });

    return res.json({ status: '200' });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

module.exports = router;
