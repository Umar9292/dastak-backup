import { Router } from 'express';
import moment from 'moment-timezone';

// import Users from '../../models/userModel';
import Products from '../../models/productsModel';
// import Marts from '../../models/martsModel';
import Orders from '../../models/ordersModel';
// import notify from '../../notificationHandler/handler';

const router = Router();

router.get('/discount', async (req, res) => {
  try {
    const products = await Products.find({
      martId: '5fa90c7c74b8060566d8ff7f',
    });

    await Promise.all(
      products.map(async product => {
        if (product.category === 'Dastak Deals') {
          const discountedPrice = ((10 / 100) * product.price).toFixed();

          product.price = +discountedPrice + +product.price;
          product.discountedPrice = +(product.price - discountedPrice);
          // product.discount = 0;
        }

        // if (product.discount === '10') {
        // product.discount = '15';
        // const discountedPrice = ((20 / 100) * product.price).toFixed();
        // product.discountedPrice = +(product.price - discountedPrice);
        // product.discount = '20';
        // }

        await product.save();
        return product;
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

/* router.get('/notifications', async (req, res) => {
  try {
    const users = await Users.find({ type: 'user' });

    // const msg = `Dear Dastak users due to current weather conditions 🌧. Our services are not available right now. We'll notify you once the services are resumed. We appreciate your patient. 😇`;

    // await notify.user(msg, '6afd2106-68f1-4825-899d-5f990adc02b8', {});

    for (const user of users) {
      const { playerId } = user;

      const msg = `Dear Dastak users due to current weather conditions 🌧. Our services are not available right now. We'll notify you once the services are resumed. We appreciate your patient. 😇`;

      await notify.user(msg, playerId, {});
    }

    return res.status(200).json('done');
  } catch (err) {
    console.error(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
}); */

/* router.get('/removeDiscount', async (req, res) => {
  try {
    const allUsers = await Users.find();

    await Promise.all(
      allUsers.map(async user => {
        const { address } = user;

        if (
          typeof address === 'object' ||
          address instanceof Array ||
          typeof address === 'string'
        ) {
          user.address = [];
          await user.save();
        }
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

router.post('/collections', async (req, res) => {
  try {
    let { startDate, endDate } = req.body;
    const thisWeeksOrders = [];

    const orders = await Orders.find({
      status: { $in: ['Delivered', 'Rider Picked Up'] },
    });

    startDate = moment(startDate, 'DD-MM-YYYY');

    endDate = moment(endDate, 'DD-MM-YYYY');

    await Promise.all(
      orders.map(async order => {
        const orderDate = moment(order.date, 'DD-MM-YYYY');

        if (
          orderDate.isSameOrAfter(startDate) &&
          orderDate.isSameOrBefore(endDate)
        ) {
          thisWeeksOrders.push(order);
        }
      })
    );

    const total = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);

    const riderFare = thisWeeksOrders.reduce((a, b) => a + b.riderFare, 0);

    return res.json({
      total,
      riderFare,
      status: '200',
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/riderCollections', async (req, res) => {
  try {
    const { date } = req.body;

    const riders = await Orders.distinct('riderName', { date });

    const data = await Promise.all(
      riders.map(async rider => {
        const orders = await Orders.find({ riderName: rider, date });

        const collection = orders.reduce((a, b) => a + b.orderTotal, 0);

        const result = {
          rider,
          collection,
        };

        return result;
      })
    );

    return res.json({
      riders,
      data,
      status: '200',
    });
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
     const userIds = await Orders.distinct('userId');
  
      await Promise.all(
        userIds.map(async userId => {
          const user = await Users.findById(userId);
  
          if (user && typeof user.address === 'object') {
            const userAddresses = await Orders.distinct('address', { userId });
  
            await Promise.all(
              userAddresses.map(async userAddress => {
                const data = {
                  street: userAddress,
                  city: '',
                };
  
                await Promise.resolve(data);
                user.address.push(data);
              })
            );
  
            await Users.findByIdAndUpdate(userId, { address: user.address });
          }
        })
      );
  
      const users = await Users.find({ type: { $in: ['user', 'admin'] } });
  
      await Promise.all(
        users.map(async user => {
          const { address } = user;
  
          if (address.length > 0) {
            await Promise.all(
              address.map(async item => {
                item.city = 'Sargodha';
              })
            );
  
            await Users.findByIdAndUpdate(user._id, { address });
          }
        })
      );
  
      const users = await Marts.find({
        shopType: 'restaurant',
        status: 'active',
      });
  
      await Promise.all(
        users.map(async user => {
          user.available = true;
          await user.save();
        })
      );

    const products = await Products.find({
      martId: '5fcf7e31728d19030781f2cf',
      category: 'IceCream',
    });

    for (const product of products) {
      if (product.quantity === 'Small') {
        product.price = 100;
      }

      if (product.quantity === 'Medium') {
        product.price = 150;
      }

      if (product.quantity === 'Large') {
        product.price = 190;
      }

      await product.save();
    }

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

export default router;
