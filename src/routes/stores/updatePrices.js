const Router = require('express/lib/router');

const StoreProducts = require('../../models/storeProducts');

const router = Router();

router.post('/updateProduct', async (req, res) => {
  try {
    const { productId } = req.body;

    await StoreProducts.findByIdAndUpdate(productId, { $set: req.body });

    return res.json({
      status: '200',
      msg: 'Product successfully updated',
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
