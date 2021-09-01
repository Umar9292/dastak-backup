const Router = require('express/lib/router');
const axios = require('axios');
const { createClient } = require('redis');

const Users = require('../../models/userModel');
const StoreProducts = require('../../models/storeProducts');
const Categories = require('../../models/categoriesModel');

const client = createClient(process.env.REDIS_URL);

const router = Router();

router.post('/allProducts', async (req, res) => {
  try {
    const {
      martId,
      userId,
      type,
      userLatitude,
      userLongitude,
      martLatitude,
      martLongitude,
    } = req.body;

    let finalData = [];

    if (type && type === 'admin') {
      const products = await StoreProducts.find({ martId }).sort({
        productName: 1,
      });

      return res.json({
        status: '200',
        data: products,
      });
    }

    client.get(martId, async (err, data) => {
      if (err) console.log(err);

      const restaurant = await Users.findById(martId).lean();

      const { data: distanceData } = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${+userLatitude},${+userLongitude}&destinations=${+martLatitude},${+martLongitude}&key=${
          process.env.GOOGLE_API_KEY
        }`
      );

      const distance = distanceData.rows[0].elements[0].distance.text.substring(
        0,
        3
      );

      let deliveryCharges = 0;

      if (+distance <= 1) {
        deliveryCharges = 20;
      }

      if (+distance > 1 && +distance <= 2) {
        deliveryCharges = 30;
      }

      if (+distance > 2 && +distance <= 4) {
        deliveryCharges = 40;
      }

      if (+distance > 4) {
        deliveryCharges = 50;
      }

      restaurant.deliveryCharges = deliveryCharges;

      if (data !== null) {
        return res.json({ status: '200', data: JSON.parse(data), restaurant });
      }

      const { categories } = await Categories.findOne({ martId })
        .select('categories')
        .lean();

      const { name } = restaurant;
      if (userId && userId !== '') {
        const customer = await Users.findById(userId).select('name');
        console.log(`${customer.name} opened ${name}`);
      } else {
        console.log(`${name} has been opened`);
      }

      for (const category of categories) {
        const query = {
          category,
          martId,
          available: 'in stock',
        };

        const products = await StoreProducts.find(query).sort({
          productName: 1,
        });

        if (products.length > 0) {
          const data = {
            category: query.category,
            data: products,
          };

          finalData = [...finalData, data];
        }
      }

      res.json({
        status: '200',
        data: finalData,
        restaurant,
      });

      client.setex(martId, 300, JSON.stringify(finalData));
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/addProduct', async (req, res) => {
  try {
    const { productName } = req.body;

    const product = await StoreProducts.findOne({ productName });
    if (product) {
      return res.json({
        status: '404',
        msg: 'Product already added',
      });
    }

    await new StoreProducts(req.body).save();

    return res.json({
      status: '200',
      msg: 'Product Added Successfully',
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
