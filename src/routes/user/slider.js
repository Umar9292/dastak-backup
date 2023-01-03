const Router = require('express/lib/router');

const Slider = require('../../models/sliderModel');

const router = Router();

router.get('/slides', async (_req, res) => {
  try {
    const { slides } = await Slider.findOne({}).lean();

    return res.json({ slides });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
      error: err.toString(),
    });
  }
});

module.exports = router;
