const Router = require('express/lib/router');

const router = Router();

const Users = require('../../../models/userModel');

router.post('/riderSignUp', async (req, res) => {
  try {
    const { phone, city } = req.body;

    if (city === 'Sargodha') {
      req.body.fareType = 'Salary';
    }

    const user = await Users.findOne({ phone, type: 'rider' });
    if (user) {
      return res.json({
        status: '404',
        msg:
          'The phone number you entered is aleady associated with another account',
      });
    }

    await new Users(req.body).save();

    res.json({ status: '200' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: `Looks like an error occurred on our side. Kindly try again`,
      error: err.toString(),
    });
  }
});

module.exports = router;
