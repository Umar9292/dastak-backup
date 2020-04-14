const express = require("express");
const router = express.Router();

const Products = require("../../models/productsModel");

router.post('/addProduct', async (req, res) => {
    try {
        const params = req.body;

        const productQuery = {
            title: params.title,
            quantity: params.quantity
        };

        const product = await Products.findOne(productQuery);
        if (product) return res.json({
            status: '404',
            msg: 'product already added'
        });

        const category = await Products.findOne({ categoryTitle: params.categoryTitle });
        params.categoryImg = category.categoryImg;

        await new Products(params).save();

        return res.json({
            status: '200',
            msg: 'Product added successfully'
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            error: err.toString(),
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

module.exports = router;