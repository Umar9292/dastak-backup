import { Router } from 'express';
import { orderBy } from 'lodash';
import moment from 'moment-timezone';

import Users from '../../models/userModel';
import Products from '../../models/productsModel';
import Flavours from '../../models/flavoursAndDrinks';
import Marts from '../../models/martsModel';
import Offers from '../../models/offersModel';
import Categories from '../../models/categoriesModel';
import { notifyUser } from '../../notificationHandler/handler';

const router = Router();

router.post('/allProducts', async (req, res) => {
  try {
    const { martId } = req.body;
    let finalData = [];

    const [{ categories }, { shopType, name }, options] = await Promise.all([
      Categories.findOne({ martId }),
      Marts.findById(martId),
      Flavours.findOne({ martId }),
    ]);

    console.log(`${name} has been opened`);

    if (shopType === 'restaurant') {
      for (const category of categories) {
        const query = {
          category,
          martId,
          available: 'in stock',
        };

        const products = await Products.find(query).sort({ productName: 1 });

        const filteredProducts = products.filter(
          ({ type, drinks }) => type === 'deal' || drinks === true
        );

        if (filteredProducts.length > 0) {
          for (const product of filteredProducts) {
            const { type, regular, drinks } = product;

            if (
              (type === 'deal' && !regular) ||
              (type === 'deal' && regular === undefined)
            ) {
              product.flavours = options.flavours;
            }

            if (type === 'deal' && regular) {
              product.flavours = options.regularFlavours;
            }

            if (drinks === true) {
              product.allDrinks = options.drinks;
            }
          }
        }

        const data = {
          category: query.category,
          data: products,
        };

        finalData = [...finalData, data];
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

    const { categories } = await Categories.findOne({ martId });

    const finalData = await Promise.all(
      categories.map(async category => {
        const query = {
          category,
          martId,
        };

        const products = await Products.find(query).sort({ productName: 1 });

        const data = {
          category,
          data: products,
        };

        return data;
      })
    );

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

    const { categories } = await Categories.findOne({ martId });

    return res.json({
      status: '200',
      data: categories,
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
            await notifyUser(offer.text, user.playerId, { flag: 'offer' });
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

router.get('/dastakDeals', async (_req, res) => {
  try {
    const currentTime = moment().tz('Asia/karachi');
    const dealsTimeStart = moment('11:00', 'HH:mm');
    const dealsTimeEnd = moment('23:59', 'HH:mm');

    console.log(currentTime);
    console.log(dealsTimeStart);
    console.log(dealsTimeEnd);

    if (!currentTime.isBetween(dealsTimeStart, dealsTimeEnd)) {
      return res.json({
        status: '404',
        msg: 'Dastak deals are available from 11am to 12pm',
      });
    }

    const restaurants = await Marts.find({
      shopType: 'restaurant',
      available: true,
      dastakDeal: true,
    });

    const openRestaurants = await Promise.all(
      restaurants.map(restaurant => {
        const { openingTime: opening, closingTime: closing, _id } = restaurant;

        let [openingTime, closingTime] = [
          moment(opening, 'HH:mm:ssa'),
          moment(closing, 'HH:mm:ssa'),
        ];

        const [openingOffSet, closingOffSet] = [
          moment(openingTime).format('a'),
          moment(closingTime).format('a'),
        ];

        console.log(openingTime);
        console.log(closingTime);

        if (
          (openingOffSet === 'pm' && closingOffSet === 'am') ||
          (openingTime === 'am' && closingOffSet === 'am')
        ) {
          closingTime = moment(closingTime).add(1, 'days');
        }

        if (currentTime.isBetween(openingTime, closingTime)) return _id;
      })
    );

    let dastakDeals = [];

    await Promise.all(
      openRestaurants.map(async martId => {
        const [restaurant, products, options] = await Promise.all([
          Users.findById(martId),

          Products.find({
            martId,
            dastakDeal: true,
            available: 'in stock',
          }),

          Flavours.findOne({ martId }),
        ]);

        if (products.length > 0) {
          for (const product of products) {
            const { regular, drinks, type } = product;

            if (
              (type === 'deal' && !regular) ||
              (type === 'deal' && regular === undefined)
            ) {
              product.flavours = options.flavours;
            }

            if (type === 'deal' && regular === true) {
              product.flavours = options.regularFlavours;
            }

            if (drinks === true) {
              product.allDrinks = options.drinks;
            }

            product.restaurant = restaurant;
            dastakDeals = [...dastakDeals, product];
          }
        }
      })
    );

    return res.json({
      status: '200',
      data: dastakDeals,
    });
  } catch (err) {
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

export default router;
