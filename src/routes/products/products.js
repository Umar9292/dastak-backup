const express = require('express');
const _ = require('lodash');

const router = express.Router();

const Products = require('../../models/productsModel');
const Flavours = require('../../models/flavoursAndDrinks');
const Marts = require('../../models/martsModel');

router.post('/allProducts', async (req, res) => {
  try {
    const { martId } = req.body;
    const allCategories = [];
    let finalData = [];

    const categories = await Products.find({ martId })
      .sort({
        category: 1,
      })
      .select('category');

    const business = await Marts.findById({ _id: martId }).select('shopType');

    await Promise.all(
      categories.map(c => {
        if (!allCategories.includes(c.category)) {
          allCategories.push(c.category);
        }
        return allCategories;
      })
    );

    if (business.shopType === 'restaurant') {
      await Promise.all(
        allCategories.map(async ac => {
          const query = {
            category: ac,
            martId,
            available: 'in stock',
          };

          const products = await Products.find(query).sort({ productName: 1 });

          await Promise.all(
            products.map(async p => {
              if (
                p.type === 'deal' &&
                (p.regular === undefined || null || false)
              ) {
                const flavoursAndDrinks = await Flavours.findOne({
                  martId,
                }).select('flavours');
                p.flavours = flavoursAndDrinks.flavours;
              }

              if (p.type === 'deal' && p.regular === true) {
                const flavoursAndDrinks = await Flavours.findOne({
                  martId,
                }).select('regularFlavours');
                p.flavours = flavoursAndDrinks.regularFlavours;
              }

              if (p.drinks === true) {
                const flavoursAndDrinks = await Flavours.findOne({
                  martId,
                }).select('drinks');
                p.allDrinks = flavoursAndDrinks.drinks;
              }
            })
          );

          const data = {
            category: ac,
            data: products,
          };

          await Promise.resolve(data);
          await Promise.resolve(finalData.push(data));
        })
      );

      finalData = _.orderBy(finalData, ['category'], ['desc']);

      return res.json({
        status: '200',
        data: finalData,
      });
    }

    await Promise.all(
      allCategories.map(async ac => {
        const query = {
          category: ac,
          martId,
          available: 'in stock',
        };

        const martProducts = await Products.find(query).sort({
          productName: 1,
        });

        const data = {
          category: ac,
          data: martProducts,
        };

        await Promise.resolve(data);
        await Promise.resolve(finalData.push(data));
      })
    );

    finalData = _.orderBy(finalData, ['category'], ['desc']);

    return res.json({
      status: '200',
      data: finalData,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/allRestaurantProducts', async (req, res) => {
  try {
    const { martId } = req.body;
    const allCategories = [];
    let finalData = [];

    const categories = await Products.find({ martId })
      .sort({
        category: 1,
      })
      .select('category');

    await Promise.all(
      categories.map(c => {
        if (!allCategories.includes(c.category)) {
          allCategories.push(c.category);
        }
        return allCategories;
      })
    );

    await Promise.all(
      allCategories.map(async ac => {
        const query = {
          category: ac,
          martId,
        };

        const products = await Products.find(query).sort({ productName: 1 });

        const data = {
          category: ac,
          data: products,
        };

        await Promise.resolve(data);
        await Promise.resolve(finalData.push(data));
      })
    );

    finalData = _.orderBy(finalData, ['category'], ['desc']);

    return res.json({
      status: '200',
      data: finalData,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/allCategories', async (req, res) => {
  try {
    const { martId } = req.body;
    const allCategories = [];

    const categories = await Products.find({ martId })
      .sort({
        category: 1,
      })
      .select('category');

    await Promise.all(
      categories.map(c => {
        if (!allCategories.includes(c.category)) {
          allCategories.push(c.category);
        }
        return allCategories;
      })
    );

    return res.json({
      status: '200',
      data: allCategories,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/productAvailability', async (req, res) => {
  try {
    const { productId } = req.body;

    await Products.findByIdAndUpdate(productId, { $set: req.body });

    return res.json({
      status: '200',
      msg: 'Product status updated',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/allMartProducts', async (req, res) => {
  try {
    const { martId, type } = req.body;
    let products;

    if (type === 'admin') {
      products = await Products.find({ martId }).sort({ productName: 1 });
    } else {
      products = await Products.find({ martId, available: 'in stock' }).sort({
        productName: 1,
      });
    }

    return res.json({
      status: '200',
      data: products,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/addAvailability', async (req, res) => {
  try {
    await Products.updateMany({}, { available: 'in stock' });

    return res.json({
      status: '200',
      msg: 'Products updated',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

/* router.get('/addBulkProducts/', async (req, res) => {
  try {
    await Products.insertMany([
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf025f',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'a) Plainger Burger',
        category: 'Beef Burgers',
        quantity:
          'Beef Patty, bun & mayo. Comes with fries & 250 ml soft drink',
        price: 349,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0260',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'b) Cheese Beefo Burger',
        category: 'Beef Burgers',
        quantity:
          'Beef Patty, bun, sause vegetables & Cheese. Comes with fries & 250 ml soft drink',
        price: 399,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0261',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'c) BBQ Cheese Beefo Burger',
        category: 'Beef Burgers',
        quantity:
          'Beef Patty, bun & BBQ sause, vegetables & Cheese. Comes with fries & 250 ml soft drink',
        price: 419,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0262',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'd) BBQ Cheddar Beefo Burger',
        category: 'Beef Burgers',
        quantity:
          'Beef Patty, bun & BBQ sause, vegetables & Cheddar Cheese. Comes with fries & 250 ml soft drink',
        price: 439,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0263',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'e) Jalapeno Cheese Beefo Burger',
        category: 'Beef Burgers',
        quantity:
          'Beef Patty, bun & spicy sause, Jalapeno, vegetables & Cheddar Cheese. Comes with fries & 250 ml soft drink',
        price: 439,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0264',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Cajun French Fries',
        category: 'French Fries',
        quantity: 'Large (Fries, Cajun, Ranch)',
        price: 180,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0265',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Chicken Cheese Fries',
        category: 'French Fries',
        quantity: 'Chicken, Fries, Cajun, Cheese, Ranch Sause',
        price: 250,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0266',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Cheese Fries',
        category: 'French Fries',
        quantity: 'Large (Fries, Cajun, Cheese, Ranch)',
        price: 215,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0267',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Plain Wings',
        category: 'Chicken Wings',
        quantity: '8 Pieces (Plain wings with Ranch)',
        price: 270,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0268',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Plain Wings',
        category: 'Chicken Wings',
        quantity: '16 Pieces (Plain wings with Ranch)',
        price: 530,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0269',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Plain Wings',
        category: 'Chicken Wings',
        quantity: '24 Pieces (Plain wings with Ranch)',
        price: 800,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf026a',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'BBQ Wings',
        category: 'Chicken Wings',
        quantity: '8 Pieces (Wings with BBQ Sause and Ranch)',
        price: 270,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf026b',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'BBQ Wings',
        category: 'Chicken Wings',
        quantity: '16 Pieces (Wings with BBQ Sause and Ranch)',
        price: 530,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf026c',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'BBQ Wings',
        category: 'Chicken Wings',
        quantity: '24 Pieces (Wings with BBQ Sause and Ranch)',
        price: 800,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf026d',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Creamy Buffalo Wings',
        category: 'Chicken Wings',
        quantity: '8 Pieces (Wings with Creamy Buffalo Sause and Ranch)',
        price: 270,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf026e',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Creamy Buffalo Wings',
        category: 'Chicken Wings',
        quantity: '16 Pieces (Wings with Creamy Buffalo Sause and Ranch)',
        price: 530,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf026f',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Creamy Buffalo Wings',
        category: 'Chicken Wings',
        quantity: '24 Pieces (Wings with Creamy Buffalo Sause and Ranch)',
        price: 800,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0270',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Chilli Garlic Wings',
        category: 'Chicken Wings',
        quantity: '8 Pieces (Wings with Chilli Garlic Sause and Ranch)',
        price: 270,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0271',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Chilli Garlic Wings',
        category: 'Chicken Wings',
        quantity: '16 Pieces (Wings with Chilli Garlic Sause and Ranch)',
        price: 530,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0272',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Chilli Garlic Wings',
        category: 'Chicken Wings',
        quantity: '24 Pieces (Wings with Chilli Garlic Sause and Ranch)',
        price: 800,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0273',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Habanero Wings',
        category: 'Chicken Wings',
        quantity: '8 Pieces (Wings with Habanero Sause (Spicy) and Ranch)',
        price: 270,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0274',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Habanero Wings',
        category: 'Chicken Wings',
        quantity: '16 Pieces (Wings with Habanero Sause (Spicy) and Ranch)',
        price: 530,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0275',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Habanero Wings',
        category: 'Chicken Wings',
        quantity: '24 Pieces (Wings with Habanero Sause (Spicy) and Ranch)',
        price: 800,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0276',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Lemon Pepper Wings',
        category: 'Chicken Wings',
        quantity: '8 Pieces (Wings with Lemon Pepper (Dry) and Ranch)',
        price: 270,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0277',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Lemon Pepper Wings',
        category: 'Chicken Wings',
        quantity: '16 Pieces (Wings with Lemon Pepper (Dry) and Ranch)',
        price: 530,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0278',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Lemon Pepper Wings',
        category: 'Chicken Wings',
        quantity: '24 Pieces (Wings with Lemon Pepper (Dry) and Ranch)',
        price: 800,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0279',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Taryaki Wings',
        category: 'Chicken Wings',
        quantity: '8 Pieces (Wings with Taryaki Sause and Ranch)',
        price: 270,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf027a',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Taryaki Wings',
        category: 'Chicken Wings',
        quantity: '16 Pieces (Wings with Taryaki Sause and Ranch)',
        price: 530,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf027b',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Taryaki Wings',
        category: 'Chicken Wings',
        quantity: '24 Pieces (Wings with Taryaki Sause and Ranch)',
        price: 800,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf027c',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Mild Wings',
        category: 'Chicken Wings',
        quantity: '8 Pieces (Wings with Buffalo Sause (Spicy) and Ranch)',
        price: 270,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf027d',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Mild Wings',
        category: 'Chicken Wings',
        quantity: '16 Pieces (Wings with Buffalo Sause (Spicy) and Ranch)',
        price: 530,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf027e',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Mild Wings',
        category: 'Chicken Wings',
        quantity: '24 Pieces (Wings with Buffalo Sause (Spicy) and Ranch)',
        price: 800,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf027f',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Ranch',
        category: "Add ON's",
        quantity: '',
        price: 20,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0280',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Extra Sause on the Side',
        category: "Add ON's",
        quantity: '',
        price: 20,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0281',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Extra Cheese in Burger',
        category: "Add ON's",
        quantity: '',
        price: 40,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0282',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Cheese on Fries',
        category: "Add ON's",
        quantity: '',
        price: 40,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0283',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Extra Cajun French Fries',
        category: "Add ON's",
        quantity: '',
        price: 40,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0284',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Extra Vagies',
        category: "Add ON's",
        quantity: '',
        price: 20,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0285',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Double Beef Patty',
        category: "Add ON's",
        quantity: '',
        price: 150,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0286',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Double Chicken',
        category: "Add ON's",
        quantity: '',
        price: 100,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf0287',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Regular Drink',
        category: 'Drinks',
        quantity: '300 ml',
        price: 40,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf028c',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'a) Chicken Burger',
        category: 'Chicken Burgers',
        quantity: 'Bun, Grilled Chicken, Lattuce, Sause & Reg Drink',
        price: 149,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf028d',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'b) Grilled Chicken Burger',
        category: 'Chicken Burgers',
        quantity: 'Bun, Chicken, mayu, Vegies comes with Fries & Reg Drink',
        price: 249,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf028e',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'c) Grilled Cheese Chicken',
        category: 'Chicken Burgers',
        quantity:
          'Bun, Chicken, Cheese, Garlic Sause, Vegies comes with Fries & Reg Drink',
        price: 299,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f4f93c79bc2c4209adf028f',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'd) Crumb Chicken Cheese',
        category: 'Chicken Burgers',
        quantity:
          'Crunch Chicken, Bun, Cheese, Vagies,Sause comes with Fries & Drink',
        price: 329,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f50cec9fd03eb3544707e53',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Cajun French Fries',
        category: 'French Fries',
        quantity: 'Small (Fries, Cajun, Ranch)',
        price: 100,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f50cf06fd03eb3544707e54',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Cheese Fries',
        category: 'French Fries',
        quantity: 'Small (Fries, Cajun, Cheese, Ranch)',
        price: 135,
        net: 0,
        count: 0,
        type: 'single',
        drinks: false,
      },
      {
        available: 'in stock',
        _id: '5f50d29bfd03eb3544707e55',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Plain Wings',
        category: 'Offers',
        quantity: '16 Pieces (Plain wings with Ranch) + 300ml Drink',
        price: 340,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f50d2dffd03eb3544707e56',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'BBQ Wings',
        category: 'Offers',
        quantity: '16 Pieces (Wings with BBQ Sause and Ranch) + 300ml Drink',
        price: 340,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f50d307fd03eb3544707e57',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Creamy Buffalo Wings',
        category: 'Offers',
        quantity:
          '16 Pieces (Wings with Creamy Buffalo Sause and Ranch) + 300ml Drink',
        price: 340,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f50d334fd03eb3544707e58',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Chilli Garlic Wings',
        category: 'Offers',
        quantity:
          '16 Pieces (Wings with Chilli Garlic Sause and Ranch) + 300ml Drink',
        price: 340,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f50d37bfd03eb3544707e5a',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Habanero Wings',
        category: 'Offers',
        quantity:
          '16 Pieces (Wings with Habanero Sause (Spicy) and Ranch) + 300ml Drink',
        price: 340,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f50d3fcfd03eb3544707e5b',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Lemon Pepper Wings',
        category: 'Offers',
        quantity:
          '16 Pieces (Wings with Lemon Pepper (Dry) and Ranch) + 300ml Drink',
        price: 340,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f50d41dfd03eb3544707e5c',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Taryaki Wings',
        category: 'Offers',
        quantity:
          '16 Pieces (Wings with Taryaki Sause and Ranch) + 300ml Drink',
        price: 340,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
      {
        available: 'in stock',
        _id: '5f50d449fd03eb3544707e5d',
        martId: '5f4f8f1b9bc2c4209adf025e',
        productName: 'Mild Wings',
        category: 'Offers',
        quantity:
          '16 Pieces (Wings with Buffalo Sause (Spicy) and Ranch) + 300ml Drink',
        price: 340,
        net: 0,
        count: 0,
        type: 'single',
        drinks: true,
      },
    ]);

    return res.json({
      status: '200',
      msg: 'Product added successfully',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.post('/deleteProducts', async (req, res) => {
  try {
    await Products.deleteMany({ martId: req.body.martId });

    return res.json({
      status: '200',
      msg: 'Products deleted',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});
 */

module.exports = router;
