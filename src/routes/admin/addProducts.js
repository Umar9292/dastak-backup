const express = require("express");
const router = express.Router();

const Products = require("../../models/productsModel");

router.post('/addProduct', async (req, res) => {
    try {
        const params = req.body;
        const productQuery = {
            title: params.title,

        };
        const product = await Products.findOne(req.body._id, { $set: req.body });

        return res.json({
            status: '200',
            msg: 'Price updated'
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