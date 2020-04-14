const express = require("express");
const router = express.Router();

const Products = require("../../models/productsModel");

router.post("/mainCategories", async (req, res) => {
    try {
        const params = req.body;
        const mainCategories = [];

        const products = await Products.find({ martId: params.martId })
            .select('mainCategory');

        await Promise.all(products.map(p => {
            if (!mainCategories.includes(p.mainCategory)) {
                mainCategories.push(p.mainCategory);
            }
        }));

        const finalCategories = await Promise.all(mainCategories.map(async m => {
            const category = await Products.findOne({ mainCategory: m })
                .select('mainCategoryImg');

            pushCategory = () => {
                const data = {
                    mainCategory: m,
                    mainCategoryImg: category.mainCategoryImg
                };

                return data;
            };

            return await Promise.resolve(pushCategory());
        }));

        return res.json({
            status: "200",
            data: finalCategories
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "404",
            error: err.toString(),
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

module.exports = router;
