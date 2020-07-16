const express = require('express');

const router = express.Router();

const Products = require('../../models/productsModel');

router.post('/allCategories', async (req, res) => {
  try {
    const mainCategories = [];

    const categories = await Products.find({ martId: req.body.martId }).select(
      'mainCategory'
    );

    await Promise.all(
      categories.map(c => {
        if (!mainCategories.includes(c.mainCategory)) {
          mainCategories.push(c.mainCategory);
        }
      })
    );

    return res.json({
      status: '200',
      mainCategories,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

module.exports = router;
