const express = require("express");
const router = express.Router();

const Products = require("../../models/productsModel");

router.post('/subCategories', async (req, res) => {
    try {
        const { martId, mainCategory } = req.body;

        const subCategories = [];

        const query = {
            martId: martId,
            mainCategory: mainCategory
        };

        const categories = await Products.find(query)
            .select('subCategory');

        await Promise.all(categories.map(c => {
            if (!subCategories.includes(c.subCategory)) {
                subCategories.push(c.subCategory)
            }
        }));

        const response = await Promise.all(subCategories.map(async s => {
            const subCategory = await Products.findOne({ subCategory: s })
                .select('subCategoryImg');

            pushData = () => {
                const data = {
                    subCategory: s,
                    subCategoryImg: subCategory.subCategoryImg
                }

                return data;
            };

            return Promise.resolve(pushData());
        }));

        return res.json({
            status: '200',
            data: response
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

router.post("/subCategoryProducts", async (req, res) => {
    try {
        const { martId, subCategory } = req.body;

        const query = {
            martId: martId,
            subCategory: subCategory
        };

        const products = await Products.find(query)
            .sort({ title: 1, quantity: 1 });

        return res.json({
            status: "200",
            data: products
        });
    }
    catch (err) {
        return res.json({
            status: "404",
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

module.exports = router;