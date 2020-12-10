const express = require('express');

const router = express.Router();

router.post('/checkVersion', async (req, res) => {
  try {
    const { platform, version } = req.body;

    if (platform === 'ios' && version === '1.5.0')
      return res.json({ status: '200' });

    /*   if (platform === 'ios' && version !== '1.4.5') {
      return res.json({
        msg: `Our app is being updated to make the experience even better for you. Kindly try again in 24 hours.`,
      });
    } */

    if (platform === 'ios' && version !== '1.5.0') {
      return res.json({
        status: '404',
        msg: `A new update is now available. kindly update your App to get the best experience`,
      });
    }

    if (platform === 'android' && version === '1.4.9')
      return res.json({ status: '200' });

    /* if (platform === 'android' && version !== '1.4.4') {
      return res.json({
        msg: `Our app is being updated to make the experience even better for you. Kindly try again in 24 hours.`,
      });
    } */

    if (platform === 'android' && version !== '1.4.9') {
      return res.json({
        status: '200',
        msg: `A new update is now available. kindly update your App to get the best experience`,
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
