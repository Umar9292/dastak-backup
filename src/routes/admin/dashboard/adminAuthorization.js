const Router = require('express/lib/router');

const User = require('../../../models/userModel');

const router = Router();

router.post('/authorization', async (req, res) => {
  try {
    const { adminId } = req.body;

    const user = await User.findById({ _id: adminId }).lean();
    if (
      !user ||
      (user.adminType !== 'admin' && user.adminType !== 'super admin')
    ) {
      return res.json({
        status: '404',
        msg: `You are not authorized.`,
      });
    }

    return res.json({ status: '200' });
  } catch (err) {
    res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

module.exports = router;
