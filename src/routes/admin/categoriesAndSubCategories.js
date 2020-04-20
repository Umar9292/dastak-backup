const express = require("express");
const router = express.Router();

const Products = require("../../models/productsModel");

/* router.get('/allCategories', async (req, res) => {
    try {
        const mainCategories = [];
        const groceryArray = [];
        const personalCareArray = [];
        const homeCareArray = [];
        const beveragesArray = [];
        const grocery = [];
        const personalCare = [];
        const homeCare = [];
        const beverages = [];

        const categories = await Products.find().select('mainCategory');

        const allcategories = categories.map(category => {
            if (!mainCategories.includes(category.mainCategory)) {
                mainCategories.push(category.mainCategory);
            }
        });
        await Promise.all(allcategories);

        const groceryCategories = await Products.find({ mainCategory: "Grocery" })
            .select("subCategory")
            .sort({ subCategory: 1 });

        const personalCareCategories = await Products.find({ mainCategory: "Personal Care" })
            .select("subCategory")
            .sort({ subCategory: 1 });

        const homeCareCategories = await Products.find({ mainCategory: "Home Care" })
            .select("subCategory")
            .sort({ subCategory: 1 });

        const beverageCategories = await Products.find({ mainCategory: "Beverages" })
            .select("subCategory")
            .sort({ subCategory: 1 });

        let allGroceryItems = groceryCategories.map(async category => {
            if (!groceryArray.includes(category.subCategory)) {
                groceryArray.push(category.subCategory);
            }
        });
        await Promise.all(allGroceryItems);

        let allGroceryCategories = groceryArray.map(async title => {
            const subCategory = await Products.findOne({ subCategory: title })
                .select("subCategory");

            pushTitle = () => {
                grocery.push(subCategory.subCategory);
            };
            await pushTitle();
        });
        await Promise.all(allGroceryCategories);

        let allPersonalCareItems = personalCareCategories.map(async category => {
            if (!personalCareArray.includes(category.subCategory)) {
                personalCareArray.push(category.subCategory);
            }
        });
        await Promise.all(allPersonalCareItems);

        let allPersonalCareCategories = personalCareArray.map(async title => {
            const subCategory = await Products.findOne({ subCategory: title })
                .select("subCategory");

            pushTitle = () => {
                personalCare.push(subCategory.subCategory);
            };
            await pushTitle();
        });
        await Promise.all(allPersonalCareCategories);

        let allHomeCareItems = homeCareCategories.map(async category => {
            if (!homeCareArray.includes(category.subCategory)) {
                homeCareArray.push(category.subCategory);
            }
        });
        await Promise.all(allHomeCareItems);

        let allHomeCareCategories = homeCareArray.map(async title => {
            const subCategory = await Products.findOne({ subCategory: title })
                .select("subCategory");

            pushTitle = () => {
                homeCare.push(subCategory.subCategory);
            };
            await pushTitle();
        });
        await Promise.all(allHomeCareCategories);

        let allBeverageItems = beverageCategories.map(async category => {
            if (!beveragesArray.includes(category.subCategory)) {
                beveragesArray.push(category.subCategory);
            }
        });
        await Promise.all(allBeverageItems);

        let allBevarageCategories = beveragesArray.map(async title => {
            const subCategory = await Products.findOne({ subCategory: title })
                .select("subCategory");

            pushTitle = () => {
                beverages.push(subCategory.subCategory);
            };
            await pushTitle();
        });
        await Promise.all(allBevarageCategories);

        return res.json({
            status: '200',
            mainCategories: mainCategories,
            grocery: grocery,
            homeCare: homeCare,
            personalCare: personalCare,
            beverages: beverages

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
 */
router.post('/allCategories', async (req, res) => {
    try {
        const mainCategories = [];

        const categories = await Products.find({ martId: req.body.martId })
            .select('mainCategory');

        await Promise.all(categories.map(c => {

            if (!mainCategories.includes(c.mainCategory)) {
                mainCategories.push(c.mainCategory);
            }

        }));

        return res.json({
            status: '200',
            mainCategories: mainCategories
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

router.post('/allSubCategories', async (req, res) => {
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
                subCategories.push(c.subCategory);
            }

        }));

        return res.json({
            status: '200',
            data: subCategories
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