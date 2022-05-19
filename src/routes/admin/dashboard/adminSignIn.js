const Router = require('express/lib/router');
const { compare } = require('bcrypt');

const User = require('../../../models/userModel');

const router = Router();

router.post('/signIn', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone }).lean();
    if (
      !user ||
      (user.adminType !== 'admin' && user.adminType !== 'super admin')
    ) {
      return res.json({
        status: '404',
        msg: `You are not authorized.`,
      });
    }

    if (user.type !== 'rider') {
      const result = await compare(password, user.password);
      if (!result) {
        return res.json({
          status: '404',
          msg: `Number or password is invalid`,
        });
      }
    }

    if (user.type === 'rider' && user.password !== password) {
      return res.json({
        status: '404',
        msg: `Number or password is invalid`,
      });
    }

    user.password = null;

    return res.json({
      status: '200',
      data: user,
    });
  } catch (err) {
    res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

module.exports = router;
