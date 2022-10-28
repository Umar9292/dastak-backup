const Router = require('express/lib/router');

const router = Router();

const CitiesModel = require('../../models/citiesModel');

router.post('/checkVersion', async (req, res) => {
  try {
    const { platform, version } = req.body;

    const url = process.env.URL;

    const { cities } = await CitiesModel.findOne({}).lean();

    if (platform === 'ios' && version === '2.2.0') {
      return res.json({ status: '200', url, cities, showCategories: 'false' });
    }

    /* if (platform === 'ios' && version !== '2.0.0') {
      return res.json({
        msg: `Our app is being updated to make the experience even better for you. Kindly try again in few hours.`,
      });
    } */

    if (platform === 'ios' && version !== '2.2.0') {
      return res.json({
        status: '404',
        msg: `A new update is now available which includes performance improvements. Kindly update your app, it won't take much of your time. Thankyou`,
        showCategories: 'false',
      });
    }

    if (platform === 'android' && version === '2.2.0') {
      return res.json({ status: '200', url, cities, showCategories: 'false' });
    }

    /* if (platform === 'android' && version !== '2.0.0') {
      return res.json({
        msg: `Our app is being updated to make the experience even better for you. Kindly try again in few hours.`,
      });
    } */

    if (platform === 'android' && version !== '2.2.0') {
      return res.json({
        status: '404',
        msg: `A new update is now available. kindly update your App to get the best experience.`,
        showCategories: 'false',
      });
    }
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
      error: err.toString(),
    });
  }
});

router.post('/vendorCheckVersion', async (req, res) => {
  try {
    const { version } = req.body;

    if (
      version === '1.3' ||
      version === '1.7' ||
      version === '1.8' ||
      version === '1.9'
    ) {
      return res.json({ status: '200' });
    }

    return res.json({
      status: '404',
      msg: `A new update is now available which includes performance improvements. Kindly update your app, it won't take much of your time. Thankyou`,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

router.post('/ridersCheckVersion', async (req, res) => {
  try {
    const { version } = req.body;

    if (version === '1.8') {
      return res.json({ status: '200' });
    }

    return res.json({
      status: '404',
      msg: `A new update is now available. kindly update your App to get the best experience.`,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
      error: err.toString(),
    });
  }
});

module.exports = router;
