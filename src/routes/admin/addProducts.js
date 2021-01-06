import Router from 'express/lib/router';

import Products from '../../models/productsModel';

const router = Router();

router.post('/addProduct', async (req, res) => {
  try {
    const params = req.body;

    const query = {
      martId: params.martId,
      productName: params.productName,
      quantity: params.quantity,
    };

    const product = await Products.findOne(query);
    if (product)
      return res.json({
        status: '404',
        msg: 'product already added',
      });

    const category = await Products.findOne({
      subCategory: params.subCategory,
    }).select('mainCategoryImg subCategoryImg');

    params.subCategoryImg = category.subCategoryImg;
    params.mainCategoryImg = category.mainCategoryImg;

    await new Products(params).save();

    return res.json({
      status: '200',
      msg: 'Product added successfully',
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
