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

    const personalCareCategories = await Products.find({ category: "Personal Care" })
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
      const titleAndImage = await Products.findOne({ categoryTitle: title })
        .select("categoryImg categoryTitle");

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
      const titleAndImage = await Products.findOne({ categoryTitle: title })
        .select("categoryImg categoryTitle");

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
      const titleAndImage = await Products.findOne({ categoryTitle: title })
        .select("categoryImg categoryTitle");

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
      const titleAndImage = await Products.findOne({ categoryTitle: title })
        .select("categoryImg categoryTitle");

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

router.get("/allProducts", async (req, res) => {
  try {
    const products = await Products.find({ martId: req.body.martId })
      .sort({ productName: 1, quantity: 1 });

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

router.get('/addBulkProducts/', async (req, res) => {

  try {
    await Products.insertMany(
      [
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sugar",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583232017/Product%20Images/Sugar_1kg_mbvgsx.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "75",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Dalda Banaspati",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231827/Product%20Images/Dalda_Banaspati_1kg_cyvilv.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "227",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Banaspati",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231749/Product%20Images/kashmir_Banaspati_1kg_spzc96.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "225",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kisan Banaspati",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231754/Product%20Images/Kisan_Banspati_1kg_z7qhiy.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "218",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Gai Banaspati",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231738/Product%20Images/Gai_Bnaspati_1kg_ict6iz.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "218",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Tullo Banaspati Ghee",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231807/Product%20Images/Tullo_Banaspati_Ghee_1kg_ixtabd.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "210",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Banaspati",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/kashmir_Banaspati_5kg_vfh5uv.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "1160",
          "quantity": "5kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Banaspati",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231749/Product%20Images/kashmir_Banaspati_2.5kg_ct2dnd.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "585",
          "quantity": "2.5kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Banaspati",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/kashmir_Banaspati_16kg_t8gqus.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "2270",
          "quantity": "10kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Banaspati",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/kashmir_Banaspati_16kg_t8gqus.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "3650",
          "quantity": "16kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Dalda Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231840/Product%20Images/Dalda_cooking_oil_1liter_ifmtfm.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "235",
          "quantity": "1Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231758/Product%20Images/Kashmir_cooking_oil_1_liter_ufwvpq.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "235",
          "quantity": "1 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kisan Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231751/Product%20Images/Kisan_cooking_oil_1liter_vvwwrh.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "228",
          "quantity": "1 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sufi Canola Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231792/Product%20Images/Sufi_canola_cooking_oil_1liter_t9it8l.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "240",
          "quantity": "1 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sufi Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231796/Product%20Images/Sufi_oil_1liter_sc2xwg.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "238",
          "quantity": "1 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Habib Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/Habib_cooking_oil_1_liter_go7g54.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "235",
          "quantity": "1 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231750/Product%20Images/Kasmir_cooking_oil_5_liter_dknxwt.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "1180",
          "quantity": "5 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231756/Product%20Images/Kashmir_cooking_oil_3_liter_grf8vt.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "1070",
          "quantity": "4.5 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231756/Product%20Images/Kashmir_cooking_oil_3_liter_grf8vt.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "710",
          "quantity": "3 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231749/Product%20Images/Kashmir_cooking_oil_10_liter_ilkvxs.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "2330",
          "quantity": "10 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kashmir Cooking Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231750/Product%20Images/Kasmir_cooking_oil_16_liter_ygkezh.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Oil & Ghee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.jpg",
          "price": "3750",
          "quantity": "16 Litre",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Daal Chana",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231833/Product%20Images/Daal_Chana_1kg_spik9v.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "155",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Daal Moong",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231820/Product%20Images/Daal_moong_1kg_ygu4ag.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "250",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Daal Masoor",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231823/Product%20Images/Daal_masoor_1kg_qey45l.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "170",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Daal Mash Chaarvi",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231833/Product%20Images/Dall_mash_charvi_1kg_qzzf8x.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "200",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Daal Mash Dhuli",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231820/Product%20Images/Daal_moong_1kg_ygu4ag.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "240",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Masar Salim",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231807/Product%20Images/Daal_masar_1kg_onuk5g.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "140",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Black Chana",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231823/Product%20Images/Black_Chana_1kg_tr0ylq.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "150",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "White Chana",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231806/Product%20Images/sufaid_chanay_1kg_ragwa1.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "120",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Red Lobia",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231778/Product%20Images/laal_lobia_1_kg_mg5mp3.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "220",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "White Lobia",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231810/Product%20Images/Sufaid_lobia_1kg_hjhfyf.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "200",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Daal Moong Chilka",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231837/Product%20Images/Daal_moong_chilka_1kg_aolnrd.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "250",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Baisan",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231806/Product%20Images/baisin_1kg_u7lby6.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "150",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Daal Mash Chilka",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231823/Product%20Images/Daal_mash_Chilka_xkm6hs.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "230",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Suji",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231790/Product%20Images/sooji_1kg_avty0f.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "60",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Super Kernal New Chawal",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231795/Product%20Images/super_kernal_old_and_new_ofo1kn.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "185",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Super Kernal Old Chawal",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231795/Product%20Images/super_kernal_old_and_new_ofo1kn.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "195",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kainaat New Chawal",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231743/Product%20Images/kainat_nata_and_purana_1kg_xrkf8g.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "130",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kainaat Old Chawal",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231743/Product%20Images/kainat_nata_and_purana_1kg_xrkf8g.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "150",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kainaat Export Quality Chawal",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Kainat_export_quality_1kg_vdmhiz.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "180",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Adhwarh Kainaat Chawal",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Kainat_export_quality_1kg_vdmhiz.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "95",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sela Chawal",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231781/Product%20Images/Sela_rice_1kg_ntzwrs.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Daalain, Rice & Flour",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.jpg",
          "price": "150",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lipton Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231774/Product%20Images/Lipton_tea_190g_otrdh8.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "225",
          "quantity": "190g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lipton Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231792/Product%20Images/Lipton_tea_100g_ejgup6.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "118",
          "quantity": "100g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lipton Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231770/Product%20Images/Lipton_tea_475g_v1c4pq.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "530",
          "quantity": "475g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lipton Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231779/Product%20Images/Lipton_tea_950g_efe64g.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "970",
          "quantity": "950g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Supreeme Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231798/Product%20Images/supreeme_tea_190g_trkfpi.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "193",
          "quantity": "190g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Supreeme Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231794/Product%20Images/supreeme_chae_100g_dsojgv.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "98",
          "quantity": "100g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Supreeme Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231796/Product%20Images/Supreeme_chae_475g_uuokmg.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "465",
          "quantity": "475g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Supreeme Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231799/Product%20Images/supreeme_chae_950g_x1xezo.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "895",
          "quantity": "950g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Danedaar Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231834/Product%20Images/Danedaar_190g_jbifz8.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "208",
          "quantity": "190g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Danedaar Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231828/Product%20Images/danedaar_100g_caicmx.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "108",
          "quantity": "100g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Danedaar Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231833/Product%20Images/danedaar_385g_ttnfm5.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "420",
          "quantity": "385g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Danedaar Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231829/Product%20Images/danedaar_95g_xwphg4.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "925",
          "quantity": "950g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Qamar Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231773/Product%20Images/qamar_chae_475g_lg3nel.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "205",
          "quantity": "190g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Qamar Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231773/Product%20Images/qamar_chae_475g_lg3nel.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "495",
          "quantity": "475g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Vital Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231804/Product%20Images/vital_tea_190g_jnob8m.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "495",
          "quantity": "475g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Vital Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231804/Product%20Images/vital_tea_190g_jnob8m.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "205",
          "quantity": "190g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Tezdum Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231805/Product%20Images/tezdu_chae_190g_gabbzb.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "198",
          "quantity": "190g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Tezdum Tea",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231801/Product%20Images/tezdu_chae_475g_g8aier.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "475",
          "quantity": "475g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Tapal Green Tea Lemon",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231803/Product%20Images/Tapal_Green_Tea_Lemon_45g_p2dyow.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "128",
          "quantity": "45g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Tapal Green Tea Apple",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231797/Product%20Images/Tapal_Green_Tea_Apple_32tb_xorp9u.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "128",
          "quantity": "32 Tb",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Tapal Green Tea Strawberry",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231799/Product%20Images/Tapal_Green_Tea_Strawberry_y0mjcy.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "128",
          "quantity": "45g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Tapal Green Tea Elaichi",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231801/Product%20Images/Tapal_Green_Tea_Ilaichi_zyg3u8.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "128",
          "quantity": "45g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Tapal Green Tea Mint",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231798/Product%20Images/Tapal_Green_Tea_Mint_edvsnj.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Tea",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.jpg",
          "price": "128",
          "quantity": "30 Tb",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kundari Red Chilli",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231766/Product%20Images/Kundari_Red_Chilli_125g_rlalz2.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "280",
          "quantity": "500g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kundari Red Chilli",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231766/Product%20Images/Kundari_Red_Chilli_125g_rlalz2.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "140",
          "quantity": "250g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Kundari Red Chilli",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231766/Product%20Images/Kundari_Red_Chilli_125g_rlalz2.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "70",
          "quantity": "125g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Haldi  Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/haldi_powder_250g_eizyx4.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "80",
          "quantity": "250g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Haldi  Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/haldi_powder_250g_eizyx4.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "40",
          "quantity": "125g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Dhania Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231791/Product%20Images/Shan_Dhania_Powder_250g_lqdkbh.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "100",
          "quantity": "250g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Dhania Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231792/Product%20Images/Shan_Dhania_Powder_125g_ancwf6.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "50",
          "quantity": "125g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sabut Dhania",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231777/Product%20Images/Sabut_Dhania_abgg39.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "50",
          "quantity": "125g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sabut Dhania",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231777/Product%20Images/Sabut_Dhania_abgg39.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "90",
          "quantity": "250g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Garam Masala Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Garam_Masala_Powder_250g_125g_62g_a3mypg.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "240",
          "quantity": "250g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Garam Masala Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Garam_Masala_Powder_250g_125g_62g_a3mypg.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "120",
          "quantity": "125g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Garam Masala Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Garam_Masala_Powder_250g_125g_62g_a3mypg.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "60",
          "quantity": "60-62g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Garam Masala Sabut",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231746/Product%20Images/Garam_Masala_Sabut_250_125_62g_v0id5p.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "220",
          "quantity": "250g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Garam Masala Sabut",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231746/Product%20Images/Garam_Masala_Sabut_250_125_62g_v0id5p.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "110",
          "quantity": "125g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Garam Masala Sabut",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231746/Product%20Images/Garam_Masala_Sabut_250_125_62g_v0id5p.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "55",
          "quantity": "62-60g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Iodized Salt",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231788/Product%20Images/Shan_Iodized_Salt_800g_pt1b78.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "35",
          "quantity": "800g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Biryani Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231780/Product%20Images/Shan_Biryani_Double_Pack_50_50g_z4knxg.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "50g+50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Qorma Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583233843/Product%20Images/Shan_Qorma_Double_Pack_qp7prp.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Karahi Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231789/Product%20Images/Shan_Karahi_Double_Pack_xz8sr9.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "100g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Achar Gosht Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583233930/Product%20Images/Shan_Achar_Gosht_Double_Pack_dgnsxg.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "50g+50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Chat Masala Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231790/Product%20Images/Shan_Chat_Masala_Double_Pack_erxw5j.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "100g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Chicken Tikka Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583234068/Product%20Images/Shan_Chicken_Tikka_Double_Pack_vgrovp.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "100g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Fish Masala Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583234168/Product%20Images/Shan_Fish_Masala_Double_Pack_h18kvv.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "50g+50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Haleem Masala Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231785/Product%20Images/Shan_Haleem_Masala_Double_Pack_yyyaku.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "50g+50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Chapli Kabab  Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231782/Product%20Images/Shan_Chapli_Kabab_Masala_vu5vq7.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "63",
          "quantity": "50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shan Tandoori Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231795/Product%20Images/Shan_Tandoori_Masala_cdmomj.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "63",
          "quantity": "50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Biryani Masala Double Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231769/Product%20Images/National_Biryani_Masala_Double_Pack_hoszwb.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "130g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Qourma Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229407/Product%20Images/National_Qourma_Masala_double_vtdon3.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "Double Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Karahi Gosht Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229407/Product%20Images/National_Karahi_Gosht_Masala_double_nefa3r.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "Double Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Achar Gosht Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229398/Product%20Images/National_Achar_Gosht_Masala_double_odktj8.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "Double Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Chat Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229402/Product%20Images/National_Chat_Masala_double_bctcac.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "Double Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Chicken Tikka Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229406/Product%20Images/National_Chicken_Tikka_Masala_double_npkxvj.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "Double Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Fish Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229404/Product%20Images/National_Fish_Masala_double_wnvmsh.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "Double Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Haleem Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229406/Product%20Images/National_Haleem_Masala_double_tmd7cc.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "115",
          "quantity": "Double Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Chapli kabab Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229403/Product%20Images/National_Chapli_kabab_Masala_single_vc8ece.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "63",
          "quantity": "Single Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Tandoori Masala",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229412/Product%20Images/National_Tandoori_Masala_single_x62qya.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "63",
          "quantity": "Single Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shangrilla Ketchup",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229418/Product%20Images/Shangrilla_Ketchup_1kg_pine6h.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "215",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shangrilla Ketchup",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229418/Product%20Images/Shangrilla_Ketchup_500g_txrkcl.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "145",
          "quantity": "500g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shangrilla Ketchup Chili Garlic",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229419/Product%20Images/Shangrilla_Ketchup_chili_garlic_500mg_xd8rfh.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "145",
          "quantity": "500g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shangrilla Ketchup Chili Garlic",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229417/Product%20Images/Shangrilla_Ketchup_chili_garlic_1kg_nm93jw.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "215",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Achar",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229399/Product%20Images/National_Achar_1kg_d05qp7.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "270",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Achar",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229398/Product%20Images/National_Achar_400g_p4lrio.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "150",
          "quantity": "400g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Soonf",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229419/Product%20Images/Soonf_250g_tv4so5.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "100",
          "quantity": "250g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Soonf",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229420/Product%20Images/Soonf_125g_azuqzi.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "50",
          "quantity": "125g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Coffee Jar",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229317/Product%20Images/Coffee_Jar_25g_wqjala.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Cold Tea, Coffee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885588/Category%20Images/Cold-TeaCoffee3952_h93w2t.jpg",
          "price": "295",
          "quantity": "25g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Coffee Sachet",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229333/Product%20Images/Coffee_Sachet_okv0xp.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Cold Tea, Coffee",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885588/Category%20Images/Cold-TeaCoffee3952_h93w2t.jpg",
          "price": "30",
          "quantity": "1 Sachet",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Hashimi Honey Glass",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229376/Product%20Images/Hashimi_Honey_Glass_300g_t4rk1o.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Jam, Honey & Spread",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885776/Category%20Images/Jam_-honey-and-spread3188_ujnlxc.jpg",
          "price": "250",
          "quantity": "300g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Knorr Cubes",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229387/Product%20Images/Knorr_Cubes_20g_tyqmln.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "35",
          "quantity": "20g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Spanish Olive Oil",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229426/Product%20Images/Spanish_Olive_Oil_100ml_ucasqo.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "185",
          "quantity": "100ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Chili Soya Sauce",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229316/Product%20Images/Chili_Soya_Sauce_trio_pack_alspfk.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "138",
          "quantity": "Tri Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Soya Sauce",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583232237/Product%20Images/Soya_Sauce_300ml_vt6qmn.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "100",
          "quantity": "300ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Chili Sauce",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229325/Product%20Images/Chili_Sauce_300ml_yiits6.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "105",
          "quantity": "300ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Rafhan Custard",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229412/Product%20Images/Rafhan_Custard_285g_sokvft.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "88",
          "quantity": "285g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Custard",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229407/Product%20Images/National_Custard_300mg_qk7jt1.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "83",
          "quantity": "300g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Custard",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231611/Product%20Images/National_Custard_120g_jmuzci.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "45",
          "quantity": "120g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Cornflour",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229355/Product%20Images/cornFlour_500g_l13yaq.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "73",
          "quantity": "500g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Shahi Tukra",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229417/Product%20Images/Shahi_Tukra_180g_qboppj.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "85",
          "quantity": "180g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Ras Malai",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229417/Product%20Images/Shahi_Tukra_180g_qboppj.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "98",
          "quantity": "75g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Gulab Jamun",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229383/Product%20Images/Gulab_Jamun_85g_wjktnp.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "100",
          "quantity": "85g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Laziza Sheer Khurma",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229394/Product%20Images/Laziza_Sheer_Khurma_160g_hochdz.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "88",
          "quantity": "160g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Laziza Kheer",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229388/Product%20Images/Laziza_Kheer_double_rr3fnl.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "140",
          "quantity": "Double Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Laziza Kheer",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229385/Product%20Images/Laziza_Kheer_single_l8qjbb.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "75",
          "quantity": "Single Pack",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "National Jam",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229408/Product%20Images/National_Jam_440g_aiqaeg.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Jam, Honey & Spread",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885776/Category%20Images/Jam_-honey-and-spread3188_ujnlxc.jpg",
          "price": "150",
          "quantity": "440g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sun Dip Jam",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229445/Product%20Images/Sun_Dip_Jam_1.8kg_autbt8.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Jam, Honey & Spread",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885776/Category%20Images/Jam_-honey-and-spread3188_ujnlxc.jpg",
          "price": "390",
          "quantity": "1.8kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Rangeen seviyan",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229415/Product%20Images/Rangeen_seviyan_big_utdcr6.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "60",
          "quantity": "Big",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Rangeen seviyan",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229416/Product%20Images/Rangeen_seviyan_small_wbja6h.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "35",
          "quantity": "Small",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "seviyan Bake Parlour",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229442/Product%20Images/seviyan_Bake_Parlour_150g_rhzxzg.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Sauces, Olives & Pickles",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.jpg",
          "price": "30",
          "quantity": "150g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Bake Parlour Macroni",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229343/Product%20Images/Bake_Parlour_Macroni_400g_xmkkqy.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "90",
          "quantity": "400g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Bake Parlour Spaghetti",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229354/Product%20Images/Bake_Parlour_Spaghetti_450g_jxzpcf.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Baking & Deserts",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.jpg",
          "price": "95",
          "quantity": "450g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Knorr Chicken Chatpata Noodles 4 in 1",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229398/Product%20Images/Knorr_Chicken_Chatpata_Noodles_4_in_1_yeqaok.jpg",
          "mainCategory": "Grocery",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519395/Main%20Category%20Images/grocery_lcp8jn.png",
          "subCategory": "Spices, Salt & Sugar",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.jpg",
          "price": "125",
          "quantity": "68g*4",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Ariel",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229314/Product%20Images/Ariel_500g_lhfuwd.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "150",
          "quantity": "500g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Ariel",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229431/Product%20Images/Ariel_80g_ffpsl4.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "20",
          "quantity": "80g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Ariel",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229432/Product%20Images/Ariel_35g_fohzkh.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "10",
          "quantity": "35g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sunlight",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229425/Product%20Images/Sunlight_850g_wbhvhf.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "99",
          "quantity": "850g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Bonus",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229314/Product%20Images/Bonus_2kg_e8uonw.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "205",
          "quantity": "2kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Bonus",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229320/Product%20Images/Bonus_950g_c5pnnr.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "105",
          "quantity": "950g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Bonus",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229316/Product%20Images/Bonus_475g_bcq0tk.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "50",
          "quantity": "475g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Bonus",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229314/Product%20Images/Bonus_95g_n6ox4r.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "10",
          "quantity": "95g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Bonus",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229319/Product%20Images/Bonus_850g_xuctdp.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "99",
          "quantity": "850g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Express",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229357/Product%20Images/Express_1kg_gcxr69.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "205",
          "quantity": "1kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Express",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229354/Product%20Images/Express_1.5kg_bpz5ti.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "290",
          "quantity": "1.5kg",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Express",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229389/Product%20Images/Express_400g_h7dvnk.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "83",
          "quantity": "400g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lux Trio Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229392/Product%20Images/Lux_Trio_Pack_110g_kadpst.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Saop, Hand Wash & Shower Gel",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.jpg",
          "price": "170",
          "quantity": "145g*3",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Dove",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229350/Product%20Images/Dove_135g_nsch1y.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Saop, Hand Wash & Shower Gel",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.jpg",
          "price": "125",
          "quantity": "135g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Palmolive Trio Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229412/Product%20Images/Palmolive_Trio_Pack_110g_uc0cce.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Saop, Hand Wash & Shower Gel",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.jpg",
          "price": "165",
          "quantity": "110g*3",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Palmolive Single Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229408/Product%20Images/Palmolive_Single_Pack_145g_nxafgz.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Saop, Hand Wash & Shower Gel",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.jpg",
          "price": "60",
          "quantity": "145g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Safegaurd Trio Pack",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229415/Product%20Images/Safegaurd_Trio_Pack_165g_rbvds2.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Saop, Hand Wash & Shower Gel",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.jpg",
          "price": "185",
          "quantity": "135g*3",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lifebuoy",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229391/Product%20Images/Lifebuoy_146g_mb8inn.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Saop, Hand Wash & Shower Gel",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.jpg",
          "price": "55",
          "quantity": "146g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lifebuoy",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229393/Product%20Images/Lifebuoy_112g_uvw2ao.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Saop, Hand Wash & Shower Gel",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.jpg",
          "price": "45",
          "quantity": "112g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Detol",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229357/Product%20Images/Detol_130g_gtjih1.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Saop, Hand Wash & Shower Gel",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.jpg",
          "price": "80",
          "quantity": "130g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Gai Soap",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229359/Product%20Images/Gai_Soap_950g_piiubo.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Laundry",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.jpg",
          "price": "70",
          "quantity": "950g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lemon Max Long Bar Double",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229389/Product%20Images/Lemon_Max_Long_Bar_Double_540g_mzsdgg.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "68",
          "quantity": "540g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lemon Max Long Bar Single",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229390/Product%20Images/Lemon_Max_Long_Bar_single_270g_ur0dcc.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "36",
          "quantity": "270g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lemon Max",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229386/Product%20Images/Lemon_Max_325g_qaozss.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "42",
          "quantity": "325g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lemon Max",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229382/Product%20Images/Lemon_Max_180g_p0qkid.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "25",
          "quantity": "180g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lemon Max",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229389/Product%20Images/Lemon_Max_104g_ynzgjw.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "12",
          "quantity": "104g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lemon Max Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229390/Product%20Images/Lemon_Max_Powder_840g_pzpbeo.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "85",
          "quantity": "840g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lemon Max Liquid",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229389/Product%20Images/Lemon_Max_Liquid_475ml_krid9q.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "145",
          "quantity": "475ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Max Powder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229404/Product%20Images/Max_Powder_900g_kblf2l.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "78",
          "quantity": "900g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Max Dish Wash Paste",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229394/Product%20Images/Max_Dish_Wash_Paste_400mg_hj7q5x.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "103",
          "quantity": "400g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Max Dish Wash Paste",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229394/Product%20Images/Max_Dish_Wash_Paste_200mg_bry6sw.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "63",
          "quantity": "200g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sponge",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229443/Product%20Images/Sponge_tjwvn1.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "80",
          "quantity": "1 Unit 1s",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Harpic Power",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229358/Product%20Images/Harpic_Power_500ml_maejsb.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "195",
          "quantity": "500ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Harpic Power",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229361/Product%20Images/Harpic_Power_250ml_fnzlqi.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "95",
          "quantity": "250ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Harpic Power Red",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229371/Product%20Images/Harpic_Power_red_500ml_o3yri3.jpg",
          "mainCategory": "Home Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519402/Main%20Category%20Images/homeCare_fkl2gn.png",
          "subCategory": "Kitchen Cleaning",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.jpg",
          "price": "190",
          "quantity": "500ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Head & Shoulder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229365/Product%20Images/Head_Shoulder_400ml_t83glo.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "420",
          "quantity": "400ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Head & Shoulder",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229367/Product%20Images/Head_Shoulder_200ml_uzguni.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "215",
          "quantity": "200ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Panteen",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229412/Product%20Images/Panteen_400ml_yvicpi.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "395",
          "quantity": "400ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Panteen",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229410/Product%20Images/Panteen_200ml_ofqzrk.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "195",
          "quantity": "200ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lifebuoy",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229394/Product%20Images/Lifebuoy_375ml_xmcmp9.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "295",
          "quantity": "375ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Lifebuoy",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229399/Product%20Images/Lifebuoy_175ml_stdtvz.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "160",
          "quantity": "175ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Palmolive",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229408/Product%20Images/Palmolive_180ml_ku0a04.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "170",
          "quantity": "180ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sunsilk Black",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229428/Product%20Images/Sunsilk_Black_200ml_ipmtxk.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "208",
          "quantity": "200ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sunsilk Pink, Yellow, Golden, Blue",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229426/Product%20Images/Sunsilk_200ml_eljz1i.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Hair Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.jpg",
          "price": "218",
          "quantity": "200ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Colgate",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229371/Product%20Images/Colgate_200g_imwg97.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "185",
          "quantity": "200g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Colgate",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229355/Product%20Images/Colgate_150g_v7dafc.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "158",
          "quantity": "150g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Colgate",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229346/Product%20Images/Colgate_100g_m8fezr.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "108",
          "quantity": "100g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Colgate",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229356/Product%20Images/Colgate_50g_t6lxw2.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "50",
          "quantity": "50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Colgate",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229332/Product%20Images/Colgate_20g_w0nrji.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "20",
          "quantity": "20g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Medicam",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229402/Product%20Images/Medicam_200g_szcoxo.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "210",
          "quantity": "200g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Medicam",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229407/Product%20Images/Medicam_70g_igt1rl.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "98",
          "quantity": "70g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Medicam",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229403/Product%20Images/Medicam_50g_rabqtg.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "63",
          "quantity": "50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Sensodyne",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583234991/Product%20Images/Sensodyne_50g_plgjpr.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "135",
          "quantity": "50g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Colgate Max Fresh",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229345/Product%20Images/Colgate_Max_Fresh_125g_yrgtjv.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "140",
          "quantity": "125g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Colgate Max Fresh",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229338/Product%20Images/Colgate_Max_Fresh_75g_huwwsw.jpg",
          "mainCategory": "Personal Care",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519396/Main%20Category%20Images/personalCare_gg0xbq.png",
          "subCategory": "Dental Care",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.jpg",
          "price": "92",
          "quantity": "75g",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Jam-E-Shirin",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229366/Product%20Images/Jam-E-Shirin_800ml_dwntef.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Sharbat",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888211/Category%20Images/Sharbat6606_f8lfy3.jpg",
          "price": "210",
          "quantity": "800ml",
          "net": "0",
          "count": "0"
        },
        {
          "martId": "5e9596f08f4e2b058164dca2",
          "productName": "Rooh Afza",
          "productImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229415/Product%20Images/Rooh_Afza_800ml_joecek.jpg",
          "mainCategory": "Beverages",
          "mainCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1586519397/Main%20Category%20Images/beverages_tukjjk.png",
          "subCategory": "Sharbat",
          "subCategoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888211/Category%20Images/Sharbat6606_f8lfy3.jpg",
          "price": "",
          "quantity": "800ml",
          "net": "0",
          "count": "0"
        }
      ]
    );

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