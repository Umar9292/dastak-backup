const express = require("express");
const router = express.Router();

const Products = require("../../models/productsModel");

router.get('/allCategories', async (req, res) => {
    try {
        const mainCategories = [];
        const subCategoriers = [];

        const categories = await Products.find().select('category categoryTitle');

        const allcategories = categories.map(category => {
            if (!mainCategories.includes(category.category)) {
                mainCategories.push(category.category);
            }

            if (!subCategoriers.includes(category.categoryTitle)) {
                subCategoriers.push(category.categoryTitle);
            }
        });
        await Promise.all(allcategories);

        return res.json({
            status: '200',
            mainCategories: mainCategories,
            subCategoriers: subCategoriers
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