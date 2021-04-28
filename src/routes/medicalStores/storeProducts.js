const Router = require('express/lib/router');
const { createClient } = require('redis');

const Users = require('../../models/userModel');
const StoreProducts = require('../../models/storeProducts');
const Categories = require('../../models/categoriesModel');

const client = createClient(process.env.REDIS_URL);

const router = Router();

router.post('/allProducts', async (req, res) => {
  try {
    const { martId, userId } = req.body;
    let finalData = [];

    client.get(martId, async (err, data) => {
      if (err) console.log(err);

      if (data !== null) {
        return res.json({ status: '200', data: JSON.parse(data) });
      }

      const [{ categories }, { name }] = await Promise.all([
        Categories.findOne({ martId })
          .select('categories')
          .lean(),

        Users.findById(martId)
          .select('name')
          .lean(),
      ]);

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

        const products = await StoreProducts.find(query)
          .sort({ productName: 1 })
          .lean();

        const data = {
          category: query.category,
          data: products,
        };

        finalData = [...finalData, data];
      }

      res.json({
        status: '200',
        data: finalData,
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

module.exports = router;
