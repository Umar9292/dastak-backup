const Router = require('express/lib/router');

const router = Router();

router.get('/referralStatus', (_req, res) => {
  try {
    return res.json({ status: '200', show: false, amount: '50' });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

module.exports = router;
