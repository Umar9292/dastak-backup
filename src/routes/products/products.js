const express = require('express');
const _ = require('lodash');

const router = express.Router();

const { orderBy } = require('lodash');
const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const Flavours = require('../../models/flavoursAndDrinks');
const Marts = require('../../models/martsModel');
const Offers = require('../../models/offersModel');
const Categories = require('../../models/categoriesModel');

const notify = require('../../notificationHandler/handler');

router.post('/allProducts', async (req, res) => {
  try {
    const { martId } = req.body;
    let finalData = [];

    const { categories } = await Categories.findOne({ martId });

    const { shopType } = await Marts.findById(martId);

    if (shopType === 'restaurant') {
      const allQueries = await Promise.all(
        categories.map(category => {
          const query = {
            category,
            martId,
            available: 'in stock',
          };

          return query;
        })
      );

      for (const query of allQueries) {
        const products = await Products.find(query).sort({ productName: 1 });

        products.map(async p => {
          if (
            p.type === 'deal' &&
            (p.regular === undefined ||
              p.regular === null ||
              p.regular === false)
          ) {
            const { flavours } = await Flavours.findOne({ martId });
            p.flavours = flavours;
          }

          if (p.type === 'deal' && p.regular === true) {
            const { regularFlavours } = await Flavours.findOne({ martId });
            p.flavours = regularFlavours;
          }

          if (p.drinks === true) {
            const { drinks } = await Flavours.findOne({ martId });
            p.allDrinks = drinks;
          }
        });

        const data = {
          category: query.category,
          data: products,
        };

        await Promise.resolve(data);

        finalData.push(data);
      }

      return res.json({
        status: '200',
        data: finalData,
      });
    }

    await Promise.all(
      categories.map(async ac => {
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
        finalData.push(data);
      })
    );

    finalData = orderBy(finalData, ['category'], ['asc']);

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

router.post('/updateProductsAvailability', async (req, res) => {
  try {
    const { category, martId, available } = req.body;

    const query = {
      category,
      martId,
    };

    await Products.updateMany(query, { $set: req.body });

    res.json({
      status: '200',
      msg: 'Status successfully updated',
    });

    if (available === 'in stock') {
      const { offers } = await Offers.findOne({ martId });

      offers.forEach(async offer => {
        if (offer.name === category) {
          const users = await Users.find({ type: 'user' });

          users.forEach(async user => {
            await notify.user(offer.text, user.playerId, { flag: 'offer' });
          });
        }
      });
    }
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

/* router.get('/test', async (req, res) => {
  try {
    // await Products.deleteMany({ martId: '5f841e770a3f9205db17ea38' });

    const products = await Products.find({
      martId: '5fa13489677c9f070a9014f0',
    });

    await Promise.all(
      products.map(async product => {
        // if (product.category !== 'Bar B.Q') {
        //   const discountedPrice = ((15 / 100) * product.price).toFixed();
        //   product.discountedPrice = +(product.price - discountedPrice);
        // }

        if (product.discount === '10') {
          // product.discount = '15';
          const discountedPrice = ((10 / 100) * product.price).toFixed();
          product.discountedPrice = +(product.price - discountedPrice);
        }

        await product.save();
        return product;
      })
    );

    return res.json('done');
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.get('/test', async (req, res) => {
  try {
    const marts = await Marts.find({ shopType: 'restaurant' });

    await Promise.all(
      marts.map(async mart => {
        const { playerIds } = mart;
        // const categories = await Products.distinct('category', { martId: id });
        // await new Categories({ martId: id, categories }).save();
        const id = 'b1f2597b-a80c-4b60-bc0f-72840e1424a3';
        playerIds.push(id);
        await mart.save();
      })
    );

    return res.json('done');
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

module.exports = router;
