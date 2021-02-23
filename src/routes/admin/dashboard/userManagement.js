const Router = require('express/lib/router');

const Users = require('../../../models/userModel');

const router = Router();

router.post('/searchUser', async (req, res) => {
  try {
    const { credentials } = req.body;

    const users = await Users.find({
      $or: [{ $text: { $search: credentials } }, { phone: credentials }],
    });

    return res.json({ status: '200', users });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
