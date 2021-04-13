const Router = require('express/lib/router');

const router = Router();

router.post('/checkVersion', async (req, res) => {
  try {
    const { platform, version } = req.body;

    if (platform === 'ios' && (version === '1.5.8' || version === '1.5.9')) {
      return res.json({ status: '200', showCategories: 'false' });
    }

    /*   if (platform === 'ios' && version !== '1.4.5') {
      return res.json({
        msg: `Our app is being updated to make the experience even better for you. Kindly try again in 24 hours.`,
      });
    } */

    if (platform === 'ios' && (version !== '1.5.8' || version !== '1.5.9')) {
      return res.json({
        status: '404',
        msg: `A new update is now available. kindly update your App to get the best experience`,
        showCategories: 'false',
      });
    }

    if (
      platform === 'android' &&
      (version === '1.5.8' || version === '1.5.9')
    ) {
      return res.json({ status: '200', showCategories: 'false' });
    }

    /* if (platform === 'android' && version !== '1.4.4') {
      return res.json({
        msg: `Our app is being updated to make the experience even better for you. Kindly try again in 24 hours.`,
      });
    } */

    if (
      platform === 'android' &&
      (version !== '1.5.8' || version !== '1.5.9')
    ) {
      return res.json({
        status: '404',
        msg: `A new update is now available. kindly update your App to get the best experience`,
        showCategories: 'false',
      });
    }
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

module.exports = router;
