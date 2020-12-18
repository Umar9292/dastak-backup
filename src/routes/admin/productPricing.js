import { Router } from 'express';

import Products from '../../models/productsModel';

const router = Router();

router.post('/updatePrice', async (req, res) => {
  try {
    await Products.findByIdAndUpdate(req.body._id, { $set: req.body });

    return res.json({
      status: '200',
      msg: 'Product updated successfully',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

export default router;
