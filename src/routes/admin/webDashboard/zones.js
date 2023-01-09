const Router = require('express/lib/router');

const Zones = require('../../../models/zonesModel');

const router = Router();

router.post('/v1/getCityZones', async (req, res) => {
  try {
    const zones = await Zones.findOne({ city: req.body.city }).lean();

    return res.json({ status: '200', zones });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
