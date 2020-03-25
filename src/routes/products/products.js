const express = require("express");
const router = express.Router();

const Products = require("../../models/productsModel");

router.get("/categoryTitlesAndImages", async (req, res) => {
  try {
    const groceryArray = [];
    const personalCareArray = [];
    const homeCareArray = [];
    const beveragesArray = [];
    const grocery = [];
    const personalCare = [];
    const homeCare = [];
    const beverages = [];

    const groceryCategories = await Products.find({ category: "Grocery" })
      .select("categoryImg categoryTitle")
      .sort({ categoryTitle: 1 });

    const personalCareCategories = await Products.find({
      category: "Personal Care"
    })
      .select("categoryImg categoryTitle")
      .sort({ categoryTitle: 1 });

    const homeCareCategories = await Products.find({ category: "Home Care" })
      .select("categoryImg categoryTitle")
      .sort({ categoryTitle: 1 });

    const beverageCategories = await Products.find({ category: "Beverages" })
      .select("categoryImg categoryTitle")
      .sort({ categoryTitle: 1 });

    let allGroceryItems = groceryCategories.map(async category => {
      if (!groceryArray.includes(category.categoryTitle)) {
        groceryArray.push(category.categoryTitle);
      }
    });
    await Promise.all(allGroceryItems);

    let allGroceryCategories = groceryArray.map(async title => {
      const titleAndImage = await Products.findOne({
        categoryTitle: title
      }).select("categoryImg categoryTitle");

      pushTitle = () => {
        grocery.push(titleAndImage);
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
      const titleAndImage = await Products.findOne({
        categoryTitle: title
      }).select("categoryImg categoryTitle");

      pushTitle = () => {
        personalCare.push(titleAndImage);
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
      const titleAndImage = await Products.findOne({
        categoryTitle: title
      }).select("categoryImg categoryTitle");

      pushTitle = () => {
        homeCare.push(titleAndImage);
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
      const titleAndImage = await Products.findOne({
        categoryTitle: title
      }).select("categoryImg categoryTitle");

      pushTitle = () => {
        beverages.push(titleAndImage);
      };
      await pushTitle();
    });
    await Promise.all(allBevarageCategories);

    return res.json({
      status: "200",
      grocery,
      homeCare,
      personalCare,
      beverages
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: "404",
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
    });
  }
});

router.post("/subCategoryProducts", async (req, res) => {
  try {
    const subCategoryProducts = await Products.find({
      categoryTitle: req.body.categoryTitle
    })
      .select("title img price net count quantity")
      .sort({ title: 1, quantity: 1 });

    return res.json({
      status: "200",
      data: subCategoryProducts
    });
  } catch (err) {
    return res.json({
      status: "404",
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
    });
  }
});

router.get("/allProducts", async (req, res) => {
  try {
    const products = await Products.find()
      .select("title img price net count quantity categoryTitle category")
      .sort({ title: 1, quantity: 1 });

    return res.json({
      status: "200",
      data: products
    });
  } catch (err) {
    return res.json({
      status: "404",
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
    });
  }
});

router.post("/specificProducts", async (req, res) => {
  try {
    /*  await Products.insertMany(
            
         );
         res.json('done')
         // const products = await Products.find({ categoryTitle: req.body.categoryTitle })
         //     .select('title net count quantity img price');
 
         // return res.json({
         //     status: '200',
         //     data: products
         // }); */
  } catch (err) {
    return res.json({
      status: "404",
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
    });
  }
});

router.post('/deleteProduct/', async (req, res) => {
  try {
    await Products.findByIdAndDelete({ _id: req.body.productId });

    return res.json({
      status: '200',
      msg: 'Product deleted successfully'
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
