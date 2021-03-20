const Router = require('express/lib/router');

const Reviews = require('../../models/reviewsModel');
const Users = require('../../models/userModel');

const router = Router();

router.post('/addReview', async (req, res) => {
  try {
    const { martId, review } = req.body;

    const allReviews = await Reviews.findOne({ martId }).select('reviews');

    if (!allReviews) {
      const { reviews } = await new Reviews({ martId, reviews: review }).save();

      res.json({
        status: '200',
        msg: 'Thankyou for your feedback',
        reviews,
      });

      await Users.findByIdAndUpdate(martId, {
        rating: reviews[0].rating,
        reviews: 1,
      });
    } else {
      allReviews.reviews.push(review);
      await allReviews.save();

      res.json({
        status: '200',
        msg: 'Thankyou for your feedback',
        reviews: allReviews.reviews,
      });

      const sumOfRatings = allReviews.reviews.reduce((a, b) => a + b.rating, 0);
      const avgRating = sumOfRatings / allReviews.reviews.length;

      await Users.findByIdAndUpdate(martId, {
        rating: avgRating.toFixed(1),
        reviews: allReviews.reviews.length,
      });
    }
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
