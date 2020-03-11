const express = require('express');
const router = express.Router();

const Products = require('../../models/productsModel');

router.get('/categoryTitlesAndImages', async (req, res) => {
    try {
        const groceryArray = [];
        const personalCareArray = [];
        const homeCareArray = [];
        const beveragesArray = [];
        const grocery = [];
        const personalCare = [];
        const homeCare = [];
        const beverages = [];

        const groceryCategories = await Products.find({ category: 'Grocery' })
            .select('categoryImg categoryTitle');

        const personalCareCategories = await Products.find({ category: 'Personal Care' })
            .select('categoryImg categoryTitle');

        const homeCareCategories = await Products.find({ category: 'Home Care' })
            .select('categoryImg categoryTitle');

        const beverageCategories = await Products.find({ category: 'Beverages' })
            .select('categoryImg categoryTitle');

        let allGroceryItems = groceryCategories.map(async category => {
            if (!groceryArray.includes(category.categoryTitle)) {
                groceryArray.push(category.categoryTitle);
            }
        });
        await Promise.all(allGroceryItems);

        let allGroceryCategories = groceryArray.map(async title => {
            const titleAndImage = await Products.findOne({ categoryTitle: title })
                .select('categoryImg categoryTitle');

            grocery.push(titleAndImage)
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
                .select('categoryImg categoryTitle');

            personalCare.push(titleAndImage)
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
                .select('categoryImg categoryTitle');

            homeCare.push(titleAndImage)
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
                .select('categoryImg categoryTitle');

            beverages.push(titleAndImage)
        });
        await Promise.all(allBevarageCategories);

        return res.json({
            status: '200',
            grocery,
            homeCare,
            personalCare,
            beverages
        });

    } catch (err) {
        console.log(err);
        return res.json({
            status: '404',
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

router.post('/subCategoryProducts', async (req, res) => {
    try {
        const subCategoryProducts = await Products.find({ categoryTitle: req.body.categoryTitle })
            .select('title img price net count quantity');

        return res.json({
            status: '200',
            data: subCategoryProducts
        });

    } catch (err) {
        return res.json({
            status: '404',
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

router.post('/specificProducts', async (req, res) => {
    try {
        /*  await Products.insertMany(
             [
                 {
                     "title": "Sugar",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "75",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583232017/Product%20Images/Sugar_1kg_mbvgsx.jpg"
                 },
                 {
                     "title": "Dalda Banaspati",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "227",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231827/Product%20Images/Dalda_Banaspati_1kg_cyvilv.png"
                 },
                 {
                     "title": "Kashmir Banaspati",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "225",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231749/Product%20Images/kashmir_Banaspati_1kg_spzc96.png"
                 },
                 {
                     "title": "Kisan Banaspati",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "218",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231754/Product%20Images/Kisan_Banspati_1kg_z7qhiy.jpg"
                 },
                 {
                     "title": "Gai Banaspati",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "218",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231738/Product%20Images/Gai_Bnaspati_1kg_ict6iz.jpg"
                 },
                 {
                     "title": "Tullo Banaspati Ghee",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "210",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231807/Product%20Images/Tullo_Banaspati_Ghee_1kg_ixtabd.png"
                 },
                 {
                     "title": "Kashmir Banaspati",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "1160",
                     "quantity": "5kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/kashmir_Banaspati_5kg_vfh5uv.jpg"
                 },
                 {
                     "title": "Kashmir Banaspati",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "585",
                     "quantity": "2.5kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231749/Product%20Images/kashmir_Banaspati_2.5kg_ct2dnd.jpg"
                 },
                 {
                     "title": "Kashmir Banaspati",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "2270",
                     "quantity": "10kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/kashmir_Banaspati_16kg_t8gqus.jpg"
                 },
                 {
                     "title": "Kashmir Banaspati",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "3650",
                     "quantity": "16kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/kashmir_Banaspati_16kg_t8gqus.jpg"
                 },
                 {
                     "title": "Dalda Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "235",
                     "quantity": "1Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231840/Product%20Images/Dalda_cooking_oil_1liter_ifmtfm.png"
                 },
                 {
                     "title": "Kashmir Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "235",
                     "quantity": "1 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231758/Product%20Images/Kashmir_cooking_oil_1_liter_ufwvpq.png"
                 },
                 {
                     "title": "Kisan Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "228",
                     "quantity": "1 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231751/Product%20Images/Kisan_cooking_oil_1liter_vvwwrh.jpg"
                 },
                 {
                     "title": "Sufi Canola Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "240",
                     "quantity": "1 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231792/Product%20Images/Sufi_canola_cooking_oil_1liter_t9it8l.jpg"
                 },
                 {
                     "title": "Sufi Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "238",
                     "quantity": "1 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231796/Product%20Images/Sufi_oil_1liter_sc2xwg.png"
                 },
                 {
                     "title": "Habib Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "235",
                     "quantity": "1 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/Habib_cooking_oil_1_liter_go7g54.png"
                 },
                 {
                     "title": "Kashmir Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "1180",
                     "quantity": "5 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231750/Product%20Images/Kasmir_cooking_oil_5_liter_dknxwt.png"
                 },
                 {
                     "title": "Kashmir Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "1070",
                     "quantity": "4.5 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231756/Product%20Images/Kashmir_cooking_oil_3_liter_grf8vt.png"
                 },
                 {
                     "title": "Kashmir Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "710",
                     "quantity": "3 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231756/Product%20Images/Kashmir_cooking_oil_3_liter_grf8vt.png"
                 },
                 {
                     "title": "Kashmir Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "2330",
                     "quantity": "10 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231749/Product%20Images/Kashmir_cooking_oil_10_liter_ilkvxs.png"
                 },
                 {
                     "title": "Kashmir Cooking Oil",
                     "category": "Grocery",
                     "categoryTitle": "Oil & Ghee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884826/Category%20Images/Oil-and-ghee4193_vvbbw8.png",
                     "price": "3750",
                     "quantity": "16 Liter",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231750/Product%20Images/Kasmir_cooking_oil_16_liter_ygkezh.png"
                 },
                 {
                     "title": "Daal Chana",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "155",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231833/Product%20Images/Daal_Chana_1kg_spik9v.png"
                 },
                 {
                     "title": "Daal Moong",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "250",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231820/Product%20Images/Daal_moong_1kg_ygu4ag.jpg"
                 },
                 {
                     "title": "Daal Masoor",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "170",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231823/Product%20Images/Daal_masoor_1kg_qey45l.png"
                 },
                 {
                     "title": "Daal Mash Chaarvi",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "200",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231833/Product%20Images/Dall_mash_charvi_1kg_qzzf8x.png"
                 },
                 {
                     "title": "Daal Mash Dhuli",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "240",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231820/Product%20Images/Daal_moong_1kg_ygu4ag.jpg"
                 },
                 {
                     "title": "Masar Salim",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "140",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231807/Product%20Images/Daal_masar_1kg_onuk5g.jpg"
                 },
                 {
                     "title": "Black Chana",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "150",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231823/Product%20Images/Black_Chana_1kg_tr0ylq.png"
                 },
                 {
                     "title": "White Chana",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "120",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231806/Product%20Images/sufaid_chanay_1kg_ragwa1.png"
                 },
                 {
                     "title": "Red Lobia",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "220",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231778/Product%20Images/laal_lobia_1_kg_mg5mp3.png"
                 },
                 {
                     "title": "White Lobia",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "200",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231810/Product%20Images/Sufaid_lobia_1kg_hjhfyf.png"
                 },
                 {
                     "title": "Daal Moong Chilka",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "250",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231837/Product%20Images/Daal_moong_chilka_1kg_aolnrd.png"
                 },
                 {
                     "title": "Baisan",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "150",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231806/Product%20Images/baisin_1kg_u7lby6.png"
                 },
                 {
                     "title": "Daal Mash Chilka",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "230",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231823/Product%20Images/Daal_mash_Chilka_xkm6hs.png"
                 },
                 {
                     "title": "Suji",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "60",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231790/Product%20Images/sooji_1kg_avty0f.png"
                 },
                 {
                     "title": "Super Kernal New Chawal",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "185",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231795/Product%20Images/super_kernal_old_and_new_ofo1kn.jpg"
                 },
                 {
                     "title": "Super Kernal Old Chawal",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "195",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231795/Product%20Images/super_kernal_old_and_new_ofo1kn.jpg"
                 },
                 {
                     "title": "Kainaat New Chawal",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "130",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231743/Product%20Images/kainat_nata_and_purana_1kg_xrkf8g.jpg"
                 },
                 {
                     "title": "Kainaat Old Chawal",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "150",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231743/Product%20Images/kainat_nata_and_purana_1kg_xrkf8g.jpg"
                 },
                 {
                     "title": "Kainaat Export Quality Chawal",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "180",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Kainat_export_quality_1kg_vdmhiz.png"
                 },
                 {
                     "title": "Adhwarh Kainaat Chawal",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "95",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Kainat_export_quality_1kg_vdmhiz.png"
                 },
                 {
                     "title": "Sela Chawal",
                     "category": "Grocery",
                     "categoryTitle": "Daalain, Rice & Flour",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885003/Category%20Images/Daalain_-Rice-_-Flour-11474_remmh6.png",
                     "price": "150",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231781/Product%20Images/Sela_rice_1kg_ntzwrs.jpg"
                 },
                 {
                     "title": "Lipton Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "225",
                     "quantity": "190g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231774/Product%20Images/Lipton_tea_190g_otrdh8.png"
                 },
                 {
                     "title": "Lipton Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "118",
                     "quantity": "100g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231792/Product%20Images/Lipton_tea_100g_ejgup6.png"
                 },
                 {
                     "title": "Lipton Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "530",
                     "quantity": "475g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231770/Product%20Images/Lipton_tea_475g_v1c4pq.png"
                 },
                 {
                     "title": "Lipton Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "970",
                     "quantity": "950g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231779/Product%20Images/Lipton_tea_950g_efe64g.png"
                 },
                 {
                     "title": "Supreeme Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "193",
                     "quantity": "190g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231798/Product%20Images/supreeme_tea_190g_trkfpi.png"
                 },
                 {
                     "title": "Supreeme Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "98",
                     "quantity": "100g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231794/Product%20Images/supreeme_chae_100g_dsojgv.png"
                 },
                 {
                     "title": "Supreeme Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "465",
                     "quantity": "475g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231796/Product%20Images/Supreeme_chae_475g_uuokmg.png"
                 },
                 {
                     "title": "Supreeme Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "895",
                     "quantity": "950g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231799/Product%20Images/supreeme_chae_950g_x1xezo.png"
                 },
                 {
                     "title": "Danedaar Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "208",
                     "quantity": "190g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231834/Product%20Images/Danedaar_190g_jbifz8.png"
                 },
                 {
                     "title": "Danedaar Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "108",
                     "quantity": "100g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231828/Product%20Images/danedaar_100g_caicmx.png"
                 },
                 {
                     "title": "Danedaar Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "420",
                     "quantity": "385g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231833/Product%20Images/danedaar_385g_ttnfm5.png"
                 },
                 {
                     "title": "Danedaar Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "925",
                     "quantity": "950g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231829/Product%20Images/danedaar_95g_xwphg4.png"
                 },
                 {
                     "title": "Qamar Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "205",
                     "quantity": "190g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231773/Product%20Images/qamar_chae_475g_lg3nel.jpg"
                 },
                 {
                     "title": "Qamar Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "495",
                     "quantity": "475g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231773/Product%20Images/qamar_chae_475g_lg3nel.jpg"
                 },
                 {
                     "title": "Vital Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "495",
                     "quantity": "475g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231804/Product%20Images/vital_tea_190g_jnob8m.png"
                 },
                 {
                     "title": "Vital Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "205",
                     "quantity": "190g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231804/Product%20Images/vital_tea_190g_jnob8m.png"
                 },
                 {
                     "title": "Tezdum Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "198",
                     "quantity": "190g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231805/Product%20Images/tezdu_chae_190g_gabbzb.png"
                 },
                 {
                     "title": "Tezdum Tea",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "475",
                     "quantity": "475g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231801/Product%20Images/tezdu_chae_475g_g8aier.png"
                 },
                 {
                     "title": "Tapal Green Tea Lemon",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "128",
                     "quantity": "45g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231803/Product%20Images/Tapal_Green_Tea_Lemon_45g_p2dyow.png"
                 },
                 {
                     "title": "Tapal Green Tea Apple",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "128",
                     "quantity": "32 Tb",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231797/Product%20Images/Tapal_Green_Tea_Apple_32tb_xorp9u.png"
                 },
                 {
                     "title": "Tapal Green Tea Strawberry",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "128",
                     "quantity": "45g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231799/Product%20Images/Tapal_Green_Tea_Strawberry_y0mjcy.png"
                 },
                 {
                     "title": "Tapal Green Tea Elaichi",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "128",
                     "quantity": "45g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231801/Product%20Images/Tapal_Green_Tea_Ilaichi_zyg3u8.png"
                 },
                 {
                     "title": "Tapal Green Tea Mint",
                     "category": "Beverages",
                     "categoryTitle": "Tea",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885181/Category%20Images/Tea4716_bvcnan.png",
                     "price": "128",
                     "quantity": "30 Tb",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231798/Product%20Images/Tapal_Green_Tea_Mint_edvsnj.png"
                 },
                 {
                     "title": "Kundari Red Chilli",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "280",
                     "quantity": "500g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231766/Product%20Images/Kundari_Red_Chilli_125g_rlalz2.png"
                 },
                 {
                     "title": "Kundari Red Chilli",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "140",
                     "quantity": "250g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231766/Product%20Images/Kundari_Red_Chilli_125g_rlalz2.png"
                 },
                 {
                     "title": "Kundari Red Chilli",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "70",
                     "quantity": "125g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231766/Product%20Images/Kundari_Red_Chilli_125g_rlalz2.png"
                 },
                 {
                     "title": "Haldi  Powder",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "80",
                     "quantity": "250g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/haldi_powder_250g_eizyx4.jpg"
                 },
                 {
                     "title": "Haldi  Powder",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "40",
                     "quantity": "125g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231748/Product%20Images/haldi_powder_250g_eizyx4.jpg"
                 },
                 {
                     "title": "Shan Dhania Powder",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "100",
                     "quantity": "250g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231791/Product%20Images/Shan_Dhania_Powder_250g_lqdkbh.png"
                 },
                 {
                     "title": "Shan Dhania Powder",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "50",
                     "quantity": "125g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231792/Product%20Images/Shan_Dhania_Powder_125g_ancwf6.png"
                 },
                 {
                     "title": "Sabut Dhania",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "50",
                     "quantity": "125g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231777/Product%20Images/Sabut_Dhania_abgg39.jpg"
                 },
                 {
                     "title": "Sabut Dhania",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "90",
                     "quantity": "250g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231777/Product%20Images/Sabut_Dhania_abgg39.jpg"
                 },
                 {
                     "title": "Garam Masala Powder",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "240",
                     "quantity": "250g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Garam_Masala_Powder_250g_125g_62g_a3mypg.jpg"
                 },
                 {
                     "title": "Garam Masala Powder",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "120",
                     "quantity": "125g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Garam_Masala_Powder_250g_125g_62g_a3mypg.jpg"
                 },
                 {
                     "title": "Garam Masala Powder",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "60",
                     "quantity": "60-62g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231742/Product%20Images/Garam_Masala_Powder_250g_125g_62g_a3mypg.jpg"
                 },
                 {
                     "title": "Garam Masala Sabut",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "220",
                     "quantity": "250g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231746/Product%20Images/Garam_Masala_Sabut_250_125_62g_v0id5p.jpg"
                 },
                 {
                     "title": "Garam Masala Sabut",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "110",
                     "quantity": "125g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231746/Product%20Images/Garam_Masala_Sabut_250_125_62g_v0id5p.jpg"
                 },
                 {
                     "title": "Garam Masala Sabut",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "55",
                     "quantity": "62-60g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231746/Product%20Images/Garam_Masala_Sabut_250_125_62g_v0id5p.jpg"
                 },
                 {
                     "title": "Shan Iodized Salt",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "35",
                     "quantity": "800g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231788/Product%20Images/Shan_Iodized_Salt_800g_pt1b78.png"
                 },
                 {
                     "title": "Shan Biryani Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "50g+50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231780/Product%20Images/Shan_Biryani_Double_Pack_50_50g_z4knxg.png"
                 },
                 {
                     "title": "Shan Qorma Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583233843/Product%20Images/Shan_Qorma_Double_Pack_qp7prp.png"
                 },
                 {
                     "title": "Shan Karahi Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "100g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231789/Product%20Images/Shan_Karahi_Double_Pack_xz8sr9.png"
                 },
                 {
                     "title": "Shan Achar Gosht Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "50g+50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583233930/Product%20Images/Shan_Achar_Gosht_Double_Pack_dgnsxg.png"
                 },
                 {
                     "title": "Shan Chat Masala Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "100g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231790/Product%20Images/Shan_Chat_Masala_Double_Pack_erxw5j.png"
                 },
                 {
                     "title": "Shan Chicken Tikka Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "100g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583234068/Product%20Images/Shan_Chicken_Tikka_Double_Pack_vgrovp.png"
                 },
                 {
                     "title": "Shan Fish Masala Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "50g+50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583234168/Product%20Images/Shan_Fish_Masala_Double_Pack_h18kvv.png"
                 },
                 {
                     "title": "Shan Haleem Masala Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "50g+50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231785/Product%20Images/Shan_Haleem_Masala_Double_Pack_yyyaku.png"
                 },
                 {
                     "title": "Shan Chapli Kabab  Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "63",
                     "quantity": "50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231782/Product%20Images/Shan_Chapli_Kabab_Masala_vu5vq7.png"
                 },
                 {
                     "title": "Shan Tandoori Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "63",
                     "quantity": "50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231795/Product%20Images/Shan_Tandoori_Masala_cdmomj.png"
                 },
                 {
                     "title": "National Biryani Masala Double Pack",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "130g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231769/Product%20Images/National_Biryani_Masala_Double_Pack_hoszwb.png"
                 },
                 {
                     "title": "National Qourma Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "Double Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229407/Product%20Images/National_Qourma_Masala_double_vtdon3.png"
                 },
                 {
                     "title": "National Karahi Gosht Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "Double Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229407/Product%20Images/National_Karahi_Gosht_Masala_double_nefa3r.png"
                 },
                 {
                     "title": "National Achar Gosht Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "Double Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229398/Product%20Images/National_Achar_Gosht_Masala_double_odktj8.png"
                 },
                 {
                     "title": "National Chat Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "Double Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229402/Product%20Images/National_Chat_Masala_double_bctcac.png"
                 },
                 {
                     "title": "National Chicken Tikka Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "Double Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229406/Product%20Images/National_Chicken_Tikka_Masala_double_npkxvj.png"
                 },
                 {
                     "title": "National Fish Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "Double Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229404/Product%20Images/National_Fish_Masala_double_wnvmsh.png"
                 },
                 {
                     "title": "National Haleem Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "115",
                     "quantity": "Double Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229406/Product%20Images/National_Haleem_Masala_double_tmd7cc.png"
                 },
                 {
                     "title": "National Chapli kabab Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "63",
                     "quantity": "Single Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229403/Product%20Images/National_Chapli_kabab_Masala_single_vc8ece.png"
                 },
                 {
                     "title": "National Tandoori Masala",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "63",
                     "quantity": "Single Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229412/Product%20Images/National_Tandoori_Masala_single_x62qya.png"
                 },
                 {
                     "title": "Shangrilla Ketchup",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "215",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229418/Product%20Images/Shangrilla_Ketchup_1kg_pine6h.png"
                 },
                 {
                     "title": "Shangrilla Ketchup",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "145",
                     "quantity": "500g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229418/Product%20Images/Shangrilla_Ketchup_500g_txrkcl.png"
                 },
                 {
                     "title": "Shangrilla Ketchup Chili Garlic",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "145",
                     "quantity": "500g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229419/Product%20Images/Shangrilla_Ketchup_chili_garlic_500mg_xd8rfh.jpg"
                 },
                 {
                     "title": "Shangrilla Ketchup Chili Garlic",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "215",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229417/Product%20Images/Shangrilla_Ketchup_chili_garlic_1kg_nm93jw.jpg"
                 },
                 {
                     "title": "National Achar",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "270",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229399/Product%20Images/National_Achar_1kg_d05qp7.jpg"
                 },
                 {
                     "title": "National Achar",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "150",
                     "quantity": "400g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229398/Product%20Images/National_Achar_400g_p4lrio.jpg"
                 },
                 {
                     "title": "Soonf",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "100",
                     "quantity": "250g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229419/Product%20Images/Soonf_250g_tv4so5.jpg"
                 },
                 {
                     "title": "Soonf",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "50",
                     "quantity": "125g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229420/Product%20Images/Soonf_125g_azuqzi.jpg"
                 },
                 {
                     "title": "Coffee Jar",
                     "category": "Beverages",
                     "categoryTitle": "Cold Tea, Coffee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885588/Category%20Images/Cold-TeaCoffee3952_h93w2t.png",
                     "price": "295",
                     "quantity": "25g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229317/Product%20Images/Coffee_Jar_25g_wqjala.jpg"
                 },
                 {
                     "title": "Coffee Sachet",
                     "category": "Beverages",
                     "categoryTitle": "Cold Tea, Coffee",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885588/Category%20Images/Cold-TeaCoffee3952_h93w2t.png",
                     "price": "30",
                     "quantity": "1 Sachet",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229333/Product%20Images/Coffee_Sachet_okv0xp.png"
                 },
                 {
                     "title": "Hashimi Honey Glass",
                     "category": "Grocery",
                     "categoryTitle": "Jam, Honey & Spread",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885776/Category%20Images/Jam_-honey-and-spread3188_ujnlxc.png",
                     "price": "250",
                     "quantity": "300g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229376/Product%20Images/Hashimi_Honey_Glass_300g_t4rk1o.jpg"
                 },
                 {
                     "title": "Knorr Cubes",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "35",
                     "quantity": "20g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229387/Product%20Images/Knorr_Cubes_20g_tyqmln.png"
                 },
                 {
                     "title": "Spanish Olive Oil",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "185",
                     "quantity": "100ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229426/Product%20Images/Spanish_Olive_Oil_100ml_ucasqo.jpg"
                 },
                 {
                     "title": "Chili Soya Sauce",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "138",
                     "quantity": "Tri Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229316/Product%20Images/Chili_Soya_Sauce_trio_pack_alspfk.jpg"
                 },
                 {
                     "title": "Soya Sauce",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "100",
                     "quantity": "300ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583232237/Product%20Images/Soya_Sauce_300ml_vt6qmn.jpg"
                 },
                 {
                     "title": "Chili Sauce",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "105",
                     "quantity": "300ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229325/Product%20Images/Chili_Sauce_300ml_yiits6.jpg"
                 },
                 {
                     "title": "Rafhan Custard",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "88",
                     "quantity": "285g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229412/Product%20Images/Rafhan_Custard_285g_sokvft.jpg"
                 },
                 {
                     "title": "National Custard",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "83",
                     "quantity": "300g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229407/Product%20Images/National_Custard_300mg_qk7jt1.jpg"
                 },
                 {
                     "title": "National Custard",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "45",
                     "quantity": "120g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583231611/Product%20Images/National_Custard_120g_jmuzci.jpg"
                 },
                 {
                     "title": "Cornflour",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "73",
                     "quantity": "500g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229355/Product%20Images/cornFlour_500g_l13yaq.jpg"
                 },
                 {
                     "title": "Shahi Tukra",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "85",
                     "quantity": "180g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229417/Product%20Images/Shahi_Tukra_180g_qboppj.jpg"
                 },
                 {
                     "title": "Ras Malai",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "98",
                     "quantity": "75g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229417/Product%20Images/Shahi_Tukra_180g_qboppj.jpg"
                 },
                 {
                     "title": "Gulab Jamun",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "100",
                     "quantity": "85g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229383/Product%20Images/Gulab_Jamun_85g_wjktnp.jpg"
                 },
                 {
                     "title": "Laziza Sheer Khurma",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "88",
                     "quantity": "160g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229394/Product%20Images/Laziza_Sheer_Khurma_160g_hochdz.png"
                 },
                 {
                     "title": "Laziza Kheer",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "140",
                     "quantity": "Double Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229388/Product%20Images/Laziza_Kheer_double_rr3fnl.jpg"
                 },
                 {
                     "title": "Laziza Kheer",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "75",
                     "quantity": "Single Pack",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229385/Product%20Images/Laziza_Kheer_single_l8qjbb.jpg"
                 },
                 {
                     "title": "National Jam",
                     "category": "Grocery",
                     "categoryTitle": "Jam, Honey & Spread",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885776/Category%20Images/Jam_-honey-and-spread3188_ujnlxc.png",
                     "price": "150",
                     "quantity": "440g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229408/Product%20Images/National_Jam_440g_aiqaeg.png"
                 },
                 {
                     "title": "Sun Dip Jam",
                     "category": "Grocery",
                     "categoryTitle": "Jam, Honey & Spread",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885776/Category%20Images/Jam_-honey-and-spread3188_ujnlxc.png",
                     "price": "390",
                     "quantity": "1.8kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229445/Product%20Images/Sun_Dip_Jam_1.8kg_autbt8.jpg"
                 },
                 {
                     "title": "Rangeen seviyan",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "60",
                     "quantity": "Big",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229415/Product%20Images/Rangeen_seviyan_big_utdcr6.jpg"
                 },
                 {
                     "title": "Rangeen seviyan",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "35",
                     "quantity": "Small",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229416/Product%20Images/Rangeen_seviyan_small_wbja6h.jpg"
                 },
                 {
                     "title": "seviyan Bake Parlour",
                     "category": "Grocery",
                     "categoryTitle": "Sauces, Olives & Pickles",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885350/Category%20Images/Sauces_-Olives-and-Pickles5329_uqy3is.png",
                     "price": "30",
                     "quantity": "150g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229442/Product%20Images/seviyan_Bake_Parlour_150g_rhzxzg.png"
                 },
                 {
                     "title": "Bake Parlour Macroni",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "90",
                     "quantity": "400g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229343/Product%20Images/Bake_Parlour_Macroni_400g_xmkkqy.png"
                 },
                 {
                     "title": "Bake Parlour Spaghetti",
                     "category": "Grocery",
                     "categoryTitle": "Baking & Deserts",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582885953/Category%20Images/Desserts4352_p2shfs.png",
                     "price": "95",
                     "quantity": "450g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229354/Product%20Images/Bake_Parlour_Spaghetti_450g_jxzpcf.jpg"
                 },
                 {
                     "title": "Knorr Chicken Chatpata Noodles 4 in 1",
                     "category": "Grocery",
                     "categoryTitle": "Spices, Salt & Sugar",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582884505/Category%20Images/Spices_-Salt-_-Sugar1688_hopvue.png",
                     "price": "125",
                     "quantity": "68g*4",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229398/Product%20Images/Knorr_Chicken_Chatpata_Noodles_4_in_1_yeqaok.jpg"
                 },
                 {
                     "title": "Ariel",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "150",
                     "quantity": "500g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229314/Product%20Images/Ariel_500g_lhfuwd.png"
                 },
                 {
                     "title": "Ariel",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "20",
                     "quantity": "80g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229431/Product%20Images/Ariel_80g_ffpsl4.png"
                 },
                 {
                     "title": "Ariel",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "10",
                     "quantity": "35g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229432/Product%20Images/Ariel_35g_fohzkh.png"
                 },
                 {
                     "title": "Sunlight",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "99",
                     "quantity": "850g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229425/Product%20Images/Sunlight_850g_wbhvhf.png"
                 },
                 {
                     "title": "Bonus",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "205",
                     "quantity": "2kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229314/Product%20Images/Bonus_2kg_e8uonw.png"
                 },
                 {
                     "title": "Bonus",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "105",
                     "quantity": "950g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229320/Product%20Images/Bonus_950g_c5pnnr.png"
                 },
                 {
                     "title": "Bonus",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "50",
                     "quantity": "475g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229316/Product%20Images/Bonus_475g_bcq0tk.png"
                 },
                 {
                     "title": "Bonus",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "10",
                     "quantity": "95g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229314/Product%20Images/Bonus_95g_n6ox4r.png"
                 },
                 {
                     "title": "Bonus",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "99",
                     "quantity": "850g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229319/Product%20Images/Bonus_850g_xuctdp.png"
                 },
                 {
                     "title": "Express",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "205",
                     "quantity": "1kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229357/Product%20Images/Express_1kg_gcxr69.png"
                 },
                 {
                     "title": "Express",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "290",
                     "quantity": "1.5kg",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229354/Product%20Images/Express_1.5kg_bpz5ti.png"
                 },
                 {
                     "title": "Express",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "83",
                     "quantity": "400g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229389/Product%20Images/Express_400g_h7dvnk.png"
                 },
                 {
                     "title": "Lux Trio Pack",
                     "category": "Personal Care",
                     "categoryTitle": "Saop, Hand Wash & Shower Gel",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.png",
                     "price": "170",
                     "quantity": "145g*3",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229392/Product%20Images/Lux_Trio_Pack_110g_kadpst.png"
                 },
                 {
                     "title": "Dove",
                     "category": "Personal Care",
                     "categoryTitle": "Saop, Hand Wash & Shower Gel",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.png",
                     "price": "125",
                     "quantity": "135g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229350/Product%20Images/Dove_135g_nsch1y.jpg"
                 },
                 {
                     "title": "Palmolive Trio Pack",
                     "category": "Personal Care",
                     "categoryTitle": "Saop, Hand Wash & Shower Gel",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.png",
                     "price": "165",
                     "quantity": "110g*3",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229412/Product%20Images/Palmolive_Trio_Pack_110g_uc0cce.png"
                 },
                 {
                     "title": "Palmolive Single Pack",
                     "category": "Personal Care",
                     "categoryTitle": "Saop, Hand Wash & Shower Gel",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.png",
                     "price": "60",
                     "quantity": "145g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229408/Product%20Images/Palmolive_Single_Pack_145g_nxafgz.png"
                 },
                 {
                     "title": "Safegaurd Trio Pack",
                     "category": "Personal Care",
                     "categoryTitle": "Saop, Hand Wash & Shower Gel",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.png",
                     "price": "185",
                     "quantity": "135g*3",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229415/Product%20Images/Safegaurd_Trio_Pack_165g_rbvds2.png"
                 },
                 {
                     "title": "Lifebuoy",
                     "category": "Personal Care",
                     "categoryTitle": "Saop, Hand Wash & Shower Gel",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.png",
                     "price": "55",
                     "quantity": "146g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229391/Product%20Images/Lifebuoy_146g_mb8inn.jpg"
                 },
                 {
                     "title": "Lifebuoy",
                     "category": "Personal Care",
                     "categoryTitle": "Saop, Hand Wash & Shower Gel",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.png",
                     "price": "45",
                     "quantity": "112g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229393/Product%20Images/Lifebuoy_112g_uvw2ao.png"
                 },
                 {
                     "title": "Detol",
                     "category": "Personal Care",
                     "categoryTitle": "Saop, Hand Wash & Shower Gel",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887358/Category%20Images/Soaps-_-handwash4498_irt3q3.png",
                     "price": "80",
                     "quantity": "130g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229357/Product%20Images/Detol_130g_gtjih1.png"
                 },
                 {
                     "title": "Gai Soap",
                     "category": "Home Care",
                     "categoryTitle": "Laundry",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887238/Category%20Images/Laundry5906_amer3q.png",
                     "price": "70",
                     "quantity": "950g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229359/Product%20Images/Gai_Soap_950g_piiubo.jpg"
                 },
                 {
                     "title": "Lemon Max Long Bar Double",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "68",
                     "quantity": "540g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229389/Product%20Images/Lemon_Max_Long_Bar_Double_540g_mzsdgg.png"
                 },
                 {
                     "title": "Lemon Max Long Bar Single",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "36",
                     "quantity": "270g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229390/Product%20Images/Lemon_Max_Long_Bar_single_270g_ur0dcc.png"
                 },
                 {
                     "title": "Lemon Max",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "42",
                     "quantity": "325g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229386/Product%20Images/Lemon_Max_325g_qaozss.png"
                 },
                 {
                     "title": "Lemon Max",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "25",
                     "quantity": "180g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229382/Product%20Images/Lemon_Max_180g_p0qkid.jpg"
                 },
                 {
                     "title": "Lemon Max",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "12",
                     "quantity": "104g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229389/Product%20Images/Lemon_Max_104g_ynzgjw.jpg"
                 },
                 {
                     "title": "Lemon Max Powder",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "85",
                     "quantity": "840g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229390/Product%20Images/Lemon_Max_Powder_840g_pzpbeo.png"
                 },
                 {
                     "title": "Lemon Max Liquid",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "145",
                     "quantity": "475ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229389/Product%20Images/Lemon_Max_Liquid_475ml_krid9q.png"
                 },
                 {
                     "title": "Max Powder",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "78",
                     "quantity": "900g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229404/Product%20Images/Max_Powder_900g_kblf2l.png"
                 },
                 {
                     "title": "Max Dish Wash Paste",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "103",
                     "quantity": "400g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229394/Product%20Images/Max_Dish_Wash_Paste_400mg_hj7q5x.png"
                 },
                 {
                     "title": "Max Dish Wash Paste",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "63",
                     "quantity": "200g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229394/Product%20Images/Max_Dish_Wash_Paste_200mg_bry6sw.png"
                 },
                 {
                     "title": "Sponge",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "80",
                     "quantity": "1 Unit 1s",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229443/Product%20Images/Sponge_tjwvn1.png"
                 },
                 {
                     "title": "Harpic Power",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "195",
                     "quantity": "500ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229358/Product%20Images/Harpic_Power_500ml_maejsb.png"
                 },
                 {
                     "title": "Harpic Power",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "95",
                     "quantity": "250ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229361/Product%20Images/Harpic_Power_250ml_fnzlqi.png"
                 },
                 {
                     "title": "Harpic Power Red",
                     "category": "Home Care",
                     "categoryTitle": "Kitchen Cleaning",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887629/Category%20Images/Kitchen7548_xokq4e.png",
                     "price": "190",
                     "quantity": "500ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229371/Product%20Images/Harpic_Power_red_500ml_o3yri3.png"
                 },
                 {
                     "title": "Head & Shoulder",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "420",
                     "quantity": "400ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229365/Product%20Images/Head_Shoulder_400ml_t83glo.png"
                 },
                 {
                     "title": "Head & Shoulder",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "215",
                     "quantity": "200ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229367/Product%20Images/Head_Shoulder_200ml_uzguni.png"
                 },
                 {
                     "title": "Panteen",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "395",
                     "quantity": "400ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229412/Product%20Images/Panteen_400ml_yvicpi.png"
                 },
                 {
                     "title": "Panteen",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "195",
                     "quantity": "200ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229410/Product%20Images/Panteen_200ml_ofqzrk.png"
                 },
                 {
                     "title": "Lifebuoy",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "295",
                     "quantity": "375ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229394/Product%20Images/Lifebuoy_375ml_xmcmp9.png"
                 },
                 {
                     "title": "Lifebuoy",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "160",
                     "quantity": "175ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229399/Product%20Images/Lifebuoy_175ml_stdtvz.png"
                 },
                 {
                     "title": "Palmolive",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "170",
                     "quantity": "180ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229408/Product%20Images/Palmolive_180ml_ku0a04.png"
                 },
                 {
                     "title": "Sunsilk Black",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "208",
                     "quantity": "200ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229428/Product%20Images/Sunsilk_Black_200ml_ipmtxk.png"
                 },
                 {
                     "title": "Sunsilk Pink, Yellow, Golden, Blue",
                     "category": "Personal Care",
                     "categoryTitle": "Hair Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582887903/Category%20Images/Hair-care9214_pluvf0.png",
                     "price": "218",
                     "quantity": "200ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229426/Product%20Images/Sunsilk_200ml_eljz1i.png"
                 },
                 {
                     "title": "Colgate",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "185",
                     "quantity": "200g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229371/Product%20Images/Colgate_200g_imwg97.png"
                 },
                 {
                     "title": "Colgate",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "158",
                     "quantity": "150g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229355/Product%20Images/Colgate_150g_v7dafc.png"
                 },
                 {
                     "title": "Colgate",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "108",
                     "quantity": "100g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229346/Product%20Images/Colgate_100g_m8fezr.png"
                 },
                 {
                     "title": "Colgate",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "50",
                     "quantity": "50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229356/Product%20Images/Colgate_50g_t6lxw2.png"
                 },
                 {
                     "title": "Colgate",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "20",
                     "quantity": "20g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229332/Product%20Images/Colgate_20g_w0nrji.png"
                 },
                 {
                     "title": "Medicam",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "210",
                     "quantity": "200g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229402/Product%20Images/Medicam_200g_szcoxo.png"
                 },
                 {
                     "title": "Medicam",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "98",
                     "quantity": "70g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229407/Product%20Images/Medicam_70g_igt1rl.png"
                 },
                 {
                     "title": "Medicam",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "63",
                     "quantity": "50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229403/Product%20Images/Medicam_50g_rabqtg.png"
                 },
                 {
                     "title": "Sensodyne",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "135",
                     "quantity": "50g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583234991/Product%20Images/Sensodyne_50g_plgjpr.jpg"
                 },
                 {
                     "title": "Colgate Max Fresh",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "140",
                     "quantity": "125g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229345/Product%20Images/Colgate_Max_Fresh_125g_yrgtjv.png"
                 },
                 {
                     "title": "Colgate Max Fresh",
                     "category": "Personal Care",
                     "categoryTitle": "Dental Care",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888060/Category%20Images/Dental-Care663_jyoxmn.png",
                     "price": "92",
                     "quantity": "75g",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229338/Product%20Images/Colgate_Max_Fresh_75g_huwwsw.png"
                 },
                 {
                     "title": "Jam-E-Shirin",
                     "category": "Beverages",
                     "categoryTitle": "Sharbat",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888211/Category%20Images/Sharbat6606_f8lfy3.png",
                     "price": "210",
                     "quantity": "800ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229366/Product%20Images/Jam-E-Shirin_800ml_dwntef.png"
                 },
                 {
                     "title": "Rooh Afza",
                     "category": "Beverages",
                     "categoryTitle": "Sharbat",
                     "categoryImg": "https://res.cloudinary.com/hmwday8rj/image/upload/v1582888211/Category%20Images/Sharbat6606_f8lfy3.png",
                     "price": "",
                     "quantity": "800ml",
                     "net": "0",
                     "count": "0",
                     "img": "https://res.cloudinary.com/hmwday8rj/image/upload/v1583229415/Product%20Images/Rooh_Afza_800ml_joecek.jpg"
                 }
             ]
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
            status: '404',
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

module.exports = router;