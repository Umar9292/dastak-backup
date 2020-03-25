const express = require("express");
const router = express.Router();

const Products = require("../../models/productsModel");

router.get('/allCategories', async (req, res) => {
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

        const categories = await Products.find().select('category');

        const allcategories = categories.map(category => {
            if (!mainCategories.includes(category.category)) {
                mainCategories.push(category.category);
            }
        });
        await Promise.all(allcategories);

        const groceryCategories = await Products.find({ category: "Grocery" })
            .select("categoryTitle")
            .sort({ categoryTitle: 1 });

        const personalCareCategories = await Products.find({ category: "Personal Care" })
            .select("categoryTitle")
            .sort({ categoryTitle: 1 });

        const homeCareCategories = await Products.find({ category: "Home Care" })
            .select("categoryTitle")
            .sort({ categoryTitle: 1 });

        const beverageCategories = await Products.find({ category: "Beverages" })
            .select("categoryTitle")
            .sort({ categoryTitle: 1 });

        let allGroceryItems = groceryCategories.map(async category => {
            if (!groceryArray.includes(category.categoryTitle)) {
                groceryArray.push(category.categoryTitle);
            }
        });
        await Promise.all(allGroceryItems);

        let allGroceryCategories = groceryArray.map(async title => {
            const subCategory = await Products.findOne({ categoryTitle: title })
                .select("categoryTitle");

            pushTitle = () => {
                grocery.push(subCategory.categoryTitle);
            };
            await pushTitle();
        });
        await Promise.all(allGroceryCategories);

        let allPersonalCareItems = personalCareCategories.map(async category => {
            if (!personalCareArray.includes(category.categoryTitle)) {
                personalCareArray.push(category.categoryTitle);
            }
        });
        await Promise.all(allPersonalCareItems);

        let allPersonalCareCategories = personalCareArray.map(async title => {
            const subCategory = await Products.findOne({ categoryTitle: title })
                .select("categoryTitle");

            pushTitle = () => {
                personalCare.push(subCategory.categoryTitle);
            };
            await pushTitle();
        });
        await Promise.all(allPersonalCareCategories);

        let allHomeCareItems = homeCareCategories.map(async category => {
            if (!homeCareArray.includes(category.categoryTitle)) {
                homeCareArray.push(category.categoryTitle);
            }
        });
        await Promise.all(allHomeCareItems);

        let allHomeCareCategories = homeCareArray.map(async title => {
            const subCategory = await Products.findOne({ categoryTitle: title })
                .select("categoryTitle");

            pushTitle = () => {
                homeCare.push(subCategory.categoryTitle);
            };
            await pushTitle();
        });
        await Promise.all(allHomeCareCategories);

        let allBeverageItems = beverageCategories.map(async category => {
            if (!beveragesArray.includes(category.categoryTitle)) {
                beveragesArray.push(category.categoryTitle);
            }
        });
        await Promise.all(allBeverageItems);

        let allBevarageCategories = beveragesArray.map(async title => {
            const subCategory = await Products.findOne({ categoryTitle: title })
                .select("categoryTitle");

            pushTitle = () => {
                beverages.push(subCategory.categoryTitle);
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

module.exports = router;