const express = require("express");
const router = express.Router();

const iffyMart = require("../../models/iffyMartModel");

router.post('/subCategories', async (req, res) => {
    try {
        const { martName, mainCategory } = req.body;

        const subCategories = [];

        if (martName === `Iffy's Mart`) {
            const categories = await iffyMart.find({ mainCategory: mainCategory })
                .select('subCategory');

            await Promise.all(categories.map(c => {
                if (!subCategories.includes(c.subCategory)) {
                    subCategories.push(c.subCategory)
                }
            }));
        }

        const response = await Promise.all(subCategories.map(async s => {
            const subCategory = await iffyMart.findOne({ subCategory: s })
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
        const { martName, subCategory } = req.body;

        let products;;

        if (martName === `Iffy's Mart`) {
            products = await iffyMart.find({ subCategory: subCategory })
                .sort({ title: 1, quantity: 1 });
        }

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