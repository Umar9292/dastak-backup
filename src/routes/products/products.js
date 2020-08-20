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
              if (p.type === 'deal') {
                const flavoursAndDrinks = await Flavours.findOne({
                  martId,
                }).select('flavours');
                p.flavours = flavoursAndDrinks.flavours;
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

      finalData = _.orderBy(finalData, ['category'], ['asc']);

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

    finalData = _.orderBy(finalData, ['category'], ['asc']);

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

    finalData = _.orderBy(finalData, ['category'], ['asc']);

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

/* router.get('/addBulkProducts/', async (req, res) => {
  try {
    await Products.insertMany([
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 1',
        category: 'Deals',
        quantity: '1 Sizzler Burger + 1 Reg Fries + 1 Reg Drink',
        price: '320',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Tikka',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Tikka',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Tikka',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Fajita',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Fajita',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Fajita',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Tandoori',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Tandoori',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Tandoori',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Supreme',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Supreme',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Supreme',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Fajita Sicilian',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Fajita Sicilian',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Fajita Sicilian',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken BBQ',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken BBQ',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken BBQ',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chese Lover',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chese Lover',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chese Lover',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Veggie Lover',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Veggie Lover',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Veggie Lover',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Achari',
        category: 'Regular Pizza',
        quantity: 'Small',
        price: '260',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Achari',
        category: 'Regular Pizza',
        quantity: 'Medium',
        price: '520',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Achari',
        category: 'Regular Pizza',
        quantity: 'Large',
        price: '780',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Palace Special',
        category: 'Special Pizza',
        quantity: 'Small',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Palace Special',
        category: 'Special Pizza',
        quantity: 'Medium',
        price: '650',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Palace Special',
        category: 'Special Pizza',
        quantity: 'Large',
        price: '850',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Mayo Garlic',
        category: 'Special Pizza',
        quantity: 'Small',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Mayo Garlic',
        category: 'Special Pizza',
        quantity: 'Medium',
        price: '650',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Mayo Garlic',
        category: 'Special Pizza',
        quantity: 'Large',
        price: '850',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Malai Boti',
        category: 'Special Pizza',
        quantity: 'Small',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Malai Boti',
        category: 'Special Pizza',
        quantity: 'Medium',
        price: '650',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Malai Boti',
        category: 'Special Pizza',
        quantity: 'Large',
        price: '850',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Behari Kabab',
        category: 'Special Pizza',
        quantity: 'Small',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Behari Kabab',
        category: 'Special Pizza',
        quantity: 'Medium',
        price: '650',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Behari Kabab',
        category: 'Special Pizza',
        quantity: 'Large',
        price: '850',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Kebab Crust',
        category: 'Crust Pizza',
        quantity: 'Medium',
        price: '700',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Sizzler Burger',
        category: 'Burgers',
        quantity: 'Large',
        price: '200',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Lasagna Pasta',
        category: 'Pastas',
        quantity: '',
        price: '320',
        net: '',
        count: '',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Zinger Burger',
        category: 'Burgers',
        quantity: '',
        price: '140',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Oven Baked Pasta',
        category: 'Pastas',
        quantity: '',
        price: '320',
        net: '',
        count: '',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Double Fillet Burger',
        category: 'Burgers',
        quantity: '',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Peeny Pasta',
        category: 'Pastas',
        quantity: '',
        price: '320',
        net: '',
        count: '',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Tower Burger',
        category: 'Burgers',
        quantity: '',
        price: '250',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Fettuccine Alfredo',
        category: 'Pastas',
        quantity: '',
        price: '320',
        net: '',
        count: '',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Patty Burger',
        category: 'Burgers',
        quantity: '',
        price: '130',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Mexican Sandwich with Fries',
        category: 'Sandwiches',
        quantity: '',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Jalapeno Burger',
        category: 'Burgers',
        quantity: '',
        price: '250',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Crispy Sandwich with Fries',
        category: 'Sandwiches',
        quantity: '',
        price: '220',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Jalapeno Grilled Burger with Fries',
        category: 'Burgers',
        quantity: '',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Club Sandwich with Fries',
        category: 'Sandwiches',
        quantity: '',
        price: '200',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Shawarma',
        category: 'Shawarmas',
        quantity: '',
        price: '100',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Cheese Shawarma',
        category: 'Shawarmas',
        quantity: '',
        price: '130',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Zinger Shawarma',
        category: 'Shawarmas',
        quantity: '',
        price: '140',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Zinger Cheese Shawarma',
        category: 'Shawarmas',
        quantity: '',
        price: '160',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Platter Shawarma',
        category: 'Shawarmas',
        quantity: '',
        price: '160',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Palace Special Paratha',
        category: 'Parathas',
        quantity: '',
        price: '200',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Grilled Cheese Paratha',
        category: 'Parathas',
        quantity: '',
        price: '200',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Zinger Paratha',
        category: 'Parathas',
        quantity: '',
        price: '160',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Grilled Sandwich with Fries',
        category: 'Sandwiches',
        quantity: '',
        price: '280',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Palace Fillet Sandwich with Fries',
        category: 'Sandwiches',
        quantity: '',
        price: '350',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 2',
        category: 'Deals',
        quantity: '1 Sizzler Burger + 1 Chicken Pc + 1 Reg Fries + 1 Reg Drink',
        price: '420',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 3',
        category: 'Deals',
        quantity: '1 Patty Burger + 1 Reg Fries + 1 Reg Drink',
        price: '250',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 4',
        category: 'Deals',
        quantity: '1 Patty Burger + 1 Chicken Pc + 1 Reg Fries + 1 Reg Drink',
        price: '350',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 5',
        category: 'Deals',
        quantity: '10 Hot Wings + 1 Reg Drink',
        price: '310',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 6',
        category: 'Deals',
        quantity: '3 Chicken Pieces + 1 Reg Drink',
        price: '380',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 7',
        category: 'Deals',
        quantity: '4 Sizzler Burger + 4 Chicken Pc + 1.5 Ltr  Drink',
        price: '1200',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 8',
        category: 'Deals',
        quantity: '5 Zinger Burger + 1 Ltr  Drink',
        price: '700',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 9',
        category: 'Deals',
        quantity: '10 Nuggets + 1 Reg Drink',
        price: '250',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Mushroom Grilled Burger with Fries',
        category: 'Burgers',
        quantity: '',
        price: '320',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 10',
        category: 'Deals',
        quantity: '1 Sizzler Burger + 1 Reg Drink',
        price: '220',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 11',
        category: 'Deals',
        quantity: '2 Zinger Burger + 10 Hot wings + 1 Ltr Drink',
        price: '600',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Kebab Crust',
        category: 'Crust Pizza',
        quantity: 'Large',
        price: '900',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Cheese Crust',
        category: 'Crust Pizza',
        quantity: 'Medium',
        price: '700',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Cheese Crust',
        category: 'Crust Pizza',
        quantity: 'Large',
        price: '900',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Crown Crust',
        category: 'Crust Pizza',
        quantity: 'Medium',
        price: '700',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Crown Crust',
        category: 'Crust Pizza',
        quantity: 'Large',
        price: '900',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Beef Special',
        category: 'Crust Pizza',
        quantity: 'Medium',
        price: '700',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Beef Special',
        category: 'Crust Pizza',
        quantity: 'Large',
        price: '900',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 12',
        category: 'Deals',
        quantity: '2 Small Pizza + 4 Zinger Burger + 1.5 Ltr Drink',
        price: '1100',
        net: '0',
        count: '0',
        type: 'deal',
        drinks: 'true',
        sizes: [
          {
            value: 'Small 1',
          },
          {
            value: 'Small 2',
          },
        ],
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 13',
        category: 'Deals',
        quantity: '1 Medium Pizza + 10 Hot Wings + 1 Ltr Drink',
        price: '850',
        net: '0',
        count: '0',
        type: 'deal',
        drinks: 'true',
        sizes: [
          {
            value: 'Medium 1',
          },
        ],
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 14',
        category: 'Deals',
        quantity: '2 Large Pizza + 1.5 Ltr Drink',
        price: '1500',
        net: '0',
        count: '0',
        type: 'deal',
        drinks: 'true',
        sizes: [
          {
            value: 'Large 1',
          },
          {
            value: 'Large 2',
          },
        ],
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Zinger Cheese Paratha',
        category: 'Parathas',
        quantity: '',
        price: '170',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Chicken Cheese Paratha',
        category: 'Parathas',
        quantity: '',
        price: '140',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Jalapeno Paratha',
        category: 'Parathas',
        quantity: '',
        price: '170',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Palace Special Paratha',
        category: 'Burgers',
        quantity: '',
        price: '130',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 15',
        category: 'Deals',
        quantity: '30 Pieces Wings + Family salad + 1.5 Ltr Drink',
        price: '1100',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Deal 16',
        category: 'Deals',
        quantity: '10 Pieces Chicken + Family salad + 1.5 Ltr Drink',
        price: '1450',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Golden Deal 1',
        category: 'Deals',
        quantity: '1 Small Pizza + 1 Shawarma + 500 ml Drink',
        price: '370',
        net: '0',
        count: '0',
        type: 'deal',
        drinks: 'true',
        sizes: [
          {
            value: 'Small 1',
          },
        ],
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Golden Deal 2',
        category: 'Deals',
        quantity: '1 Medium Pizza + 1 Zinger Burger + 1 Ltr Drink',
        price: '730',
        net: '0',
        count: '0',
        type: 'deal',
        drinks: 'true',
        sizes: [
          {
            value: 'Medium 1',
          },
        ],
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Golden Deal 3',
        category: 'Deals',
        quantity: '1 Large Pizza + 1 Zinger Burger+ 1 Shawarma  + 1 Ltr Drink',
        price: '1050',
        net: '0',
        count: '0',
        type: 'deal',
        drinks: 'true',
        sizes: [
          {
            value: 'Large 1',
          },
        ],
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Combo Deal 4',
        category: 'Deals',
        quantity:
          '1 Zinger Burger + 1 Chicken Piece + 1 Reg Fries + 500 ml Drink',
        price: '400',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Combo Deal 5',
        category: 'Deals',
        quantity: '1 Patty Burger + 1 Chicken Pc + 1 Reg Fries + 500 ml Drink',
        price: '370',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Combo Deal 6',
        category: 'Deals',
        quantity: '2 Zinger Burger + 3 Chicken Piece + 1 Ltr Drink',
        price: '820',
        net: '0',
        count: '0',
        type: 'single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Tikka Paratha',
        category: 'Parathas',
        quantity: '',
        price: '140',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Kebab Paratha',
        category: 'Parathas',
        quantity: '',
        price: '150',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Pizza Paratha',
        category: 'Parathas',
        quantity: '',
        price: '280',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Regular Drink',
        category: 'Beverages',
        quantity: '',
        price: '40',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Tin Pack',
        category: 'Beverages',
        quantity: '',
        price: '60',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Diet Drink',
        category: 'Beverages',
        quantity: '',
        price: '60',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: '500 ml Drink',
        category: 'Beverages',
        quantity: '',
        price: '60',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: '1 Litre Drink',
        category: 'Beverages',
        quantity: '',
        price: '90',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: '1.5 Litre Drink',
        category: 'Beverages',
        quantity: '',
        price: '130',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'true',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Mineral Water',
        category: 'Beverages',
        quantity: 'Small',
        price: '40',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Mineral Water',
        category: 'Beverages',
        quantity: 'Large',
        price: '80',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Regular Fries',
        category: 'Fries',
        quantity: '',
        price: '100',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Large Fries',
        category: 'Fries',
        quantity: '',
        price: '180',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Family Fries',
        category: 'Fries',
        quantity: '',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Mayo Fries',
        category: 'Fries',
        quantity: '',
        price: '200',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Cheese Fries',
        category: 'Fries',
        quantity: '',
        price: '250',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Small Salad',
        category: 'Salad',
        quantity: '',
        price: '130',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Large Salad',
        category: 'Salad',
        quantity: '',
        price: '240',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
      },
      {
        martId: '5f3b8a44a06990276d95f415',
        productName: 'Family Salad',
        category: 'Salad',
        quantity: '',
        price: '300',
        net: '0',
        count: '0',
        type: 'Single',
        drinks: 'false',
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

module.exports = router;
