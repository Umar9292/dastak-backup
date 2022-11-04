const Router = require('express/lib/router');

const Cities = require('../../models/citiesModel');

const router = Router();

router.post('/contactDetails', async (req, res) => {
  try {
    const { city } = req.body;

    const { cities } = await Cities.findOne(
      {
        cities: {
          $elemMatch: {
            value: city,
          },
        },
      },
      {
        'cities.$': 1,
      }
    ).lean();

    const { address, phone, email } = cities[0];

    res.json({ status: '200', address, phone, email });
  } catch (err) {
    console.log(err);
    return res.json({
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
