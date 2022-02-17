const Router = require('express/lib/router');
const moment = require('moment-timezone');
const crypto = require('crypto');
const axios = require('axios');
const { unlinkSync } = require('fs');
const { IncomingForm } = require('formidable');
const { randomBytes } = require('crypto');

const Users = require('../../models/userModel');
const Products = require('../../models/productsModel');
const Orders = require('../../models/ordersModel');

const router = Router();

router.get('/changePrices', async (_req, res) => {
  try {
    const products = await Products.find({
      martId: '618a5d8cb80721592bc18e92',
    });

    await Promise.all(
      products.map(product => {
        // if (product.category === 'Grilled Burgers') {
        let discountedPrice = ((40 / 100) * product.price).toFixed();
        discountedPrice = Math.round(discountedPrice / 5) * 5;
        product.discountedPrice = product.price - +discountedPrice;
        product.discount = '40';
        // product.actualPrice = product.discountedPrice;
        return product.save();
        // }
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
});

router.post('/closeRestaurants', async (req, res) => {
  try {
    const { searchFlag, updateFlag, city } = req.body;

    await Users.updateMany(
      {
        city,
        type: 'admin',
        status: 'active',
        available: searchFlag,
      },
      { available: updateFlag }
    );

    return res.json({ status: '200', msg: 'done' });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/createRidersPassword', async (_req, res) => {
  try {
    const riders = await Users.find({ type: 'rider' });

    await Promise.all(
      riders.map(async rider => {
        const newPassword = randomBytes(4);
        rider.password = newPassword.toString('hex');
        await rider.save();
      })
    );

    return res.json({ riders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/test', async (_req, res) => {
  try {
    const riders = await Users.find({
      shopType: 'restaurant',
      status: 'active',
    });

    console.log(riders.length);

    await Promise.all(
      riders.map(async rider => {
        rider.playerIds.push('834173c1-ba3e-4260-9a45-fe6e1bac0097');

        // rider.playerIds = rider.playerIds.filter(
        //   id => id !== '834173c1-ba3e-4260-9a45-fe6e1bac0097'
        // );

        await rider.save();
      })
    );

    return res.json({ riders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/addActualPrices', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const restaurants = await Orders.distinct('martId', {
      status: 'Delivered',
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    await Promise.all(
      restaurants.map(async martId => {
        const orders = await Orders.find({
          martId,
          status: 'Delivered',
          dateForSearching: { $gte: start, $lte: end },
        });

        await Promise.all(
          orders.map(async order => {
            const { products, _id } = order;
            let testProducts = [];

            await Promise.all(
              products.map(async p => {
                const { productName, quantity } = p;

                if (
                  productName.includes('Azadi Deal') ||
                  productName.includes('Discounted Deal') ||
                  productName.includes('Zabardast Deal')
                ) {
                  const product = await Products.findOne({
                    martId,
                    productName,
                    quantity,
                  });

                  if (!product) {
                    console.log(`order id = ${_id}`);
                  }

                  if (product.actualPrice !== undefined) {
                    p.actualPrice = product.actualPrice;
                    testProducts = [...testProducts, p];
                  }
                } else {
                  testProducts = [...testProducts, p];
                }
              })
            );

            await Orders.findByIdAndUpdate(_id, { products: testProducts });
          })
        );
      })
    );

    return res.json({ status: '200' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

/* router.post('/addActualPrices', async (req, res) => {
  try {
    const { startDate, endDate, martId } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const orders = await Orders.find({
      martId,
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    await Promise.all(
      orders.map(async order => {
        const { products, _id } = order;
        let testProducts = [];

        await Promise.all(
          products.map(async p => {
            const { productName, quantity } = p;

            if (
              productName.includes('Azadi Deal') ||
              productName.includes('Discounted Deal') ||
              productName.includes('Zabardast Deal')
            ) {
              const product = await Products.findOne({
                martId,
                productName,
                quantity,
              });

              if (!product) {
                console.log(`order id = ${_id}`);
              }

              if (product.actualPrice !== undefined) {
                p.actualPrice = product.actualPrice;
                testProducts = [...testProducts, p];
              }
            } else {
              testProducts = [...testProducts, p];
            }
          })
        );

        await Orders.findByIdAndUpdate(_id, { products: testProducts });
      })
    );

    return res.json({ status: '200' });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

router.post('/dealCount', async (req, res) => {
  try {
    const { martId, startDate, endDate, dealName } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    let small = 0;
    let medium = 0;
    let large = 0;

    const deliveryOrders = await Orders.find({
      martId,
      status: 'Delivered',
      orderType: 'Delivery',
      dateForSearching: { $gte: start, $lte: end },
    })
      .select('products')
      .lean();

    await Promise.all(
      deliveryOrders.map(async ({ products }) => {
        await Promise.all(
          products.map(async ({ productName, count, quantity }) => {
            if (productName.includes(dealName)) {
              if (quantity.includes('Small')) {
                small += count;
              }

              if (quantity.includes('Medium')) {
                medium += count;
              }

              if (quantity.includes('Large')) {
                large += count;
              }
            }
          })
        );
      })
    );

    return res.json({
      small,
      medium,
      large,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/unpayRestaurant', async (req, res) => {
  try {
    const { martId, startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const updatedOrders = await Orders.updateMany(
      {
        martId,
        dateForSearching: {
          $gte: start,
          $lte: end,
        },
      },
      { paid: false }
    );

    return res.json({ updatedOrders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/uploadPicture', (req, res) => {
  try {
    const form = new IncomingForm();

    form.uploadDir = 'uploads';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;

    form.parse(req, async (_err, _fields, files) => {
      const img = files.image.path;

      const user = await Users.findByIdAndUpdate(
        { _id: '5f312d42d9d50a3bebf4611a' },
        { img },
        { new: true }
      );

      unlinkSync(img);

      return res.json(user);
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg:
        'Looks like something went wrong on our side. Sorry for the incinvenience',
    });
  }
});

router.post('/testAlgorithm', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    const end = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    const users = await Orders.distinct('userId', {
      status: 'Delivered',
      city: 'Sargodha',
      orderTotal: { $gte: 400 },
      dateForSearching: {
        $gte: start,
        $lte: end,
      },
    });

    const usersOrderData = await Promise.all(
      users.map(async userId => {
        const thisUsersOrders = await Orders.find({
          status: 'Delivered',
          userId,
          orderTotal: { $gte: 400 },
          dateForSearching: {
            $gte: start,
            $lte: end,
          },
        })
          .select('time date products name')
          .lean();

        const [dates, times] = await Promise.all([
          thisUsersOrders.map(({ date }) => date),
          thisUsersOrders.map(({ time }) => time),
        ]);

        return {
          name: thisUsersOrders[0].name,
          totalOrders: thisUsersOrders.length,
          dates,
          times,
        };
      })
    );

    return res.json({ usersOrderData });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

/* router.get('/test', async (_req, res) => {
  try {
    const dealProducts = await Products.find({
      type: 'deal',
      sizes: { $ne: undefined },
    });

    await Promise.all(
      dealProducts.map(async product => {
        let specifications = [];

        const { sizes, drinks } = product;

        if (drinks) {
          specifications = [
            ...specifications,
            {
              productName: 'Choose your drink',
              productType: 'drink',
              flavourType: 'regular',
            },
          ];
        }

        let smallPizzaCount = 1;
        let mediumPizzaCount = 1;
        let largePizzaCount = 1;

        sizes.map(({ value }) => {
          if (value.includes('Small')) {
            specifications = [
              ...specifications,
              {
                productName: `Small Pizza ${smallPizzaCount}`,
                productType: 'pizza',
                flavourType: product.regular ? 'regular' : 'dealFlavours',
              },
            ];

            smallPizzaCount += 1;
          }

          if (value.includes('Medium')) {
            specifications = [
              ...specifications,
              {
                productName: `Medium Pizza ${mediumPizzaCount}`,
                productType: 'pizza',
                flavourType: product.regular ? 'regular' : 'dealFlavours',
              },
            ];

            mediumPizzaCount += 1;
          }

          if (value.includes('Large')) {
            specifications = [
              ...specifications,
              {
                productName: `Large Pizza ${largePizzaCount}`,
                productType: 'pizza',
                flavourType: product.regular ? 'regular' : 'dealFlavours',
              },
            ];

            largePizzaCount += 1;
          }
        });

        product.specifications = specifications;
        await product.save();
      })
    );

    return res.json({ dealProducts });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

router.get('/updateFares', async (_req, res) => {
  try {
    const riders = await Users.updateMany(
      { type: 'rider', city: 'Sargodha' },
      { tillNoonFare: 70, nightFare: 70, lateNightFare: 80 }
    );

    return res.json({ riders });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/jazzCashCallback', async (req, res) => {
  console.log(req.body);

  return res.redirect(
    `https://dastakbackend.herokuapp.com/alreadyVerified/views`
  );
});

router.get('/alfaTest', async (req, res) => {
  try {
    const key1 = 'pwq3HgMxFCPHwEVp';
    const key2 = '4726651892310964';

    const randomString = crypto.randomBytes(6).toString('hex');

    const handShakeString = `HS_ChannelId=1001&HS_MerchantId=13619&HS_StoreId=020000&HS_MerchantHash=zWsOsg0VNuBwmQH5oZC9rqye/+tv5+AXRYQS/HpxSYG67qUjRhrrAa/b79m78NXZJo8VJwLIgW0=&HS_MerchantUsername=nyqoba&HS_MerchantPassword=53P2WUBwaPNvFzk4yqF7CA==&HS_ReturnURL=http://192.168.1.8:8080/general/alfaCallback&HS_IsRedirectionRequest=0&HS_TransactionReferenceNumber=${randomString}`;

    const handShakeCipher = crypto.createCipheriv('AES-128-CBC', key1, key2);
    const handShakeHash =
      handShakeCipher.update(handShakeString, 'utf8', 'base64') +
      handShakeCipher.final('base64');

    const handShakeData = {
      HS_RequestHash: handShakeHash,
      HS_IsRedirectionRequest: '0',
      HS_ChannelId: '1001',
      HS_ReturnURL: 'http://192.168.1.8:8080/general/alfaCallback',
      HS_MerchantId: '13619',
      HS_StoreId: '020000',
      HS_MerchantHash:
        'zWsOsg0VNuBwmQH5oZC9rqye/+tv5+AXRYQS/HpxSYG67qUjRhrrAa/b79m78NXZJo8VJwLIgW0=',
      HS_MerchantUsername: 'nyqoba',
      HS_MerchantPassword: '53P2WUBwaPNvFzk4yqF7CA==',
      HS_TransactionReferenceNumber: randomString,
    };

    const result = await axios.post(
      'https://sandbox.bankalfalah.com/HS/HS/HS',
      handShakeData
    );

    console.log(result.data);

    const { AuthToken } = result.data;

    const redirectionString = `AuthToken=${AuthToken}&RequestHash=null&ChannelId=1001&Currency=PKR&IsBIN=0&ReturnURL=http://192.168.1.8:8080/general/alfaCallback&MerchantId=13619&StoreId=020000&MerchantHash=zWsOsg0VNuBwmQH5oZC9rqye/+tv5+AXRYQS/HpxSYG67qUjRhrrAa/b79m78NXZJo8VJwLIgW0=&MerchantUsername=nyqoba&MerchantPassword=53P2WUBwaPNvFzk4yqF7CA==&TransactionTypeId=3&TransactionReferenceNumber=${randomString}&TransactionAmount=100&`;

    const cipher = crypto.createCipheriv('AES-128-CBC', key1, key2);
    const redirectionHash =
      cipher.update(redirectionString, 'utf8', 'base64') +
      cipher.final('base64');

    const body = {
      AuthToken,
      RequestHash: redirectionHash,
      ChannelId: '1001',
      Currency: 'PKR',
      IsBIN: '0',
      ReturnURL: 'http://192.168.1.8:8080/general/alfaTest',
      MerchantId: '13619',
      StoreId: '020000',
      MerchantHash:
        'zWsOsg0VNuBwmQH5oZC9rqye/+tv5+AXRYQS/HpxSYG67qUjRhrrAa/b79m78NXZJo8VJwLIgW0=',
      MerchantUsername: 'nyqoba',
      MerchantPassword: '53P2WUBwaPNvFzk4yqF7CA==',
      TransactionTypeId: '3',
      TransactionReferenceNumber: randomString,
      TransactionAmount: '100',
    };

    const doc = await axios.post(
      'https://sandbox.bankalfalah.com/SSO/SSO/SSO',
      body
    );

    console.log(doc.data);

    return res.json({
      status: '200',
      redirectionHash,
      AuthToken: result.data.AuthToken,
    });
  } catch (err) {
    console.log(err);
    return res.json({ status: '404' });
  }
});

router.get('/alfaCallback', async (req, res) => {
  console.log(req.query);
});

router.get('/getHash', async (_req, res) => {
  try {
    const currentDate = moment()
      .tz('Asia/Karachi')
      .format('YYYYMMDDHHmmss');

    const expiryDate = moment()
      .tz('Asia/Karachi')
      .add(1, 'days')
      .format('YYYYMMDDHHmmss');

    const str = `2y8htx8218&100&Torder2&abcxyz&EN&00280104&cg02s2c7u4&https://dastakbackend.herokuapp.com/general/jazzCashCallback&PKR&${currentDate}&${expiryDate}&T${currentDate}&MWALLET&1.1`;

    const secret = '2y8htx8218';
    const sha256Hasher = crypto.createHmac('sha256', secret);
    const hash = sha256Hasher.update(str).digest('hex');

    console.log(hash, currentDate, expiryDate);

    res.json({
      status: '200',
      hash,
      currentDate,
      expiryDate,
      txnRefNumber: `T${currentDate}`,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
