const Router = require('express/lib/router');
const moment = require('moment-timezone');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');
const Mart = require('../../models/martsModel');
const {
  orderStatusEmail,
} = require('../../emailHandler/orderConfirmationEmail/orderStatusEmail');
const {
  emailOrderDetailsToRider,
} = require('../../emailHandler/riderEmail/riderEmail');
const {
  sendAcceptanceEmail,
} = require('../../emailHandler/customerEmail/acceptanceEmail');
const {
  emailOrderDetails,
  notifyRestaurantByEmail,
} = require('../../emailHandler/orderEmail/orderEmail');
const {
  emailOrderDetailsToCustomer,
} = require('../../emailHandler/customerEmail/customerEmail');
const {
  notifyUser,
  notifyAdmin,
  notifyRiders,
} = require('../../notificationHandler/handler');

const router = Router();

router.post('/placeOrder', async (req, res) => {
  try {
    let params = req.body;
    const { orderTotal, martId, userId, products, date } = params;

    const mart = await Mart.findById(martId).select('-password -__v');

    if (!mart.available) {
      return res.json({
        status: '404',
        msg: `Sorry the ${mart.shopType} is not available due to some reason`,
      });
    }

    if (+orderTotal < mart.minimumOrder) {
      return res.json({ msg: `Minimun order is Rs ${mart.minimumOrder}` });
    }

    const orderTime = moment().tz('Asia/karachi');
    const formatedTime = moment(orderTime, 'hh:mm').format('hh:mm a');

    params = {
      ...params,
      products: await JSON.parse(products),
      martId: mart._id,
      martName: mart.name,
      martPhone: mart.phone,
      martAddress: mart.martAddress,
      time: formatedTime,
      dateForSearching: moment(date, 'DD-MM-YYYY')
        .tz('Asia/Karachi')
        .toISOString(),
    };

    const order = await new Orders(params).save();

    const adminMessage = 'You have a new order';
    const info = `New Order for ${params.martName} placed by ${order.name}`;

    const { playerIds: restaurantPlayerIds } = mart;
    restaurantPlayerIds.forEach(async playerId => {
      await notifyAdmin(info, adminMessage, playerId, {
        flag: 'adminReceived',
      });
    });

    res.json({
      status: '200',
      msg: `Order Received`,
      data: order,
    });

    const user = await Users.findById(userId).select('-password -__v');

    const count = params.products.reduce((a, b) => a + b.count, 0);

    if (mart.email && mart.email !== '' && user.email.includes('@')) {
      notifyRestaurantByEmail(mart.email);
    }

    emailOrderDetails(
      mart,
      user,
      formatedTime,
      params.address,
      params.products,
      count,
      params.orderTotal
    );

    if (user.email && user.email !== '' && user.email.includes('@')) {
      emailOrderDetailsToCustomer(
        user,
        mart,
        params.date,
        params.orderTotal,
        params.address,
        params.products,
        count
      );
    }
  } catch (err) {
    console.error(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/checkTime', async (req, res) => {
  try {
    const { martId } = req.body;

    const orderTime = moment().tz('Asia/karachi');

    let { openingTime, closingTime, shopType, name } = await Mart.findById(
      martId
    ).select('-password -__v');

    openingTime = moment(openingTime, 'HH:mm:ssa').tz('Asia/karachi');
    closingTime = moment(closingTime, 'HH:mm:ssa').tz('Asia/karachi');

    openingTime = moment(openingTime).subtract(5, 'hours');
    closingTime = moment(closingTime).subtract(5, 'hours');

    const openingTimeOffSet = moment(openingTime).format('a');
    const closingTimeOffSet = moment(closingTime).format('a');

    if (
      (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') ||
      (openingTimeOffSet === 'am' && closingTimeOffSet === 'am')
    ) {
      closingTime = moment(closingTime).add(1, 'days');
    }

    if (
      orderTime.isBetween(
        `${openingTime.toISOString()}`,
        `${closingTime.toISOString()}`
      )
    ) {
      return res.json({ status: '200' });
    }

    if (shopType === 'mart') {
      return res.json({
        status: '204',
        msg: `${name} has been closed. You can still place your order but it will be entertained after it opens at ${openingTime}`,
      });
    }

    console.log(`${name} is closed`);

    return res.json({
      status: '404',
      msg: `${name} is closed`,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/allOrders', async (req, res) => {
  try {
    const { martId } = req.body;

    const [upcoming, accepted, delivered] = await Promise.all([
      Orders.find({ martId, status: 'Pending' })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({
        martId,
        status: {
          $in: ['Admin Accepted', 'Rider Accepted', 'Rider Picked Up'],
        },
      })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({
        martId,
        paid: { $in: [false, undefined] },
        status: 'Delivered',
      })
        .sort({
          createdAt: -1,
        })
        .lean(),
    ]);

    return res.json({
      status: '200',
      upcoming,
      accepted,
      delivered,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/orderDetails', async (req, res) => {
  try {
    const order = await Orders.findById(req.body.orderId);

    return res.json({
      status: '200',
      data: order,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/specificUserOrders', async (req, res) => {
  try {
    const orders = await Orders.find({ userId: req.body.userId })
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.json({
      status: '200',
      data: orders,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/adminResponse', async (req, res) => {
  try {
    const {
      orderNum,
      reason,
      orderId,
      status,
      orderType,
      customerNotified,
    } = req.body;

    const { status: orderStatus } = await Orders.findById(orderId);

    if (orderStatus === 'Rejected') {
      return res.json({ status: '404', msg: 'Already Rejected' });
    }

    if (
      orderStatus !== 'Pending' &&
      status !== 'Rejected' &&
      orderType !== 'PickUp'
    ) {
      return res.json({ status: '404', msg: 'Already Accepted' });
    }

    const order = await Orders.findByIdAndUpdate(orderId, {
      $set: req.body,
    });

    const [user, shop] = await Promise.all([
      Users.findById(order.userId),
      Mart.findById(order.martId),
    ]);

    const ridersMessage = `New order from ${shop.name}`;

    if (status === 'Rejected') {
      const msg = `Dear ${user.name} your order# ${orderNum} could not be accepted by ${shop.shopType} because ${reason}`;

      if (user.type === 'admin') {
        const { playerIds } = shop;

        playerIds.forEach(async playerId => {
          await notifyUser(msg, playerId, { flag: 'orderRejected' });
        });
      } else {
        await notifyUser(msg, user.playerId, { flag: 'orderRejected' });
      }

      order.reason = reason;
      order.orderNum = orderNum;
      await order.save();

      const adminMessage = `The order number ${orderNum} has been rejected by ${shop.name} because it's ${reason}`;
      orderStatusEmail(adminMessage);

      res.json({
        status: '200',
        msg: 'Order successfully rejected',
      });

      if (order.riderId) {
        const ongoingOrders = await Orders.countDocuments({
          riderId: order.riderId,
          status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
        });

        if (ongoingOrders === 0) {
          await Users.findByIdAndUpdate(order.riderId, { status: 'idle' });
        }
      }
    }

    if (status === 'Admin Accepted') {
      if (orderType === 'PickUp') {
        const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's ready.`;
        sendAcceptanceEmail(user.email !== '' ? user.email : '', msg);

        if (user.type === 'admin') {
          const { playerIds } = user;

          playerIds.forEach(async playerId => {
            await notifyUser(msg, playerId, { flag: 'preparingOrder' });
          });
        } else {
          await notifyUser(msg, user.playerId, { flag: 'preparingOrder' });
        }

        const adminMessage = `The order number ${orderNum} has been accepted by ${shop.name}. It's a pick up order.`;
        orderStatusEmail(adminMessage);

        return res.json({
          status: '200',
          msg: 'Order successfully accepted',
        });
      }

      const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's dispatched.`;
      await notifyUser(msg, user.playerId, { flag: 'preparingOrder' });
      sendAcceptanceEmail(user.email !== '' ? user.email : '', msg);

      const idleRiders = await Users.find({
        type: 'rider',
        status: 'idle',
        available: true,
      });

      const allRiders = await Users.find({ type: 'rider', available: true });

      if (idleRiders.length === 0) {
        const riderEmails = await Promise.all(
          allRiders.map(async rider => {
            const { name, email, playerId } = rider;

            await notifyRiders(name, ridersMessage, playerId, {
              flag: 'riderNotified',
            });

            return email;
          })
        );

        emailOrderDetailsToRider(riderEmails);
      }

      const riderEmails = await Promise.all(
        idleRiders.map(async rider => {
          const { name, email, playerId } = rider;

          await notifyRiders(name, ridersMessage, playerId, {
            flag: 'riderNotified',
          });

          return email;
        })
      );

      emailOrderDetailsToRider(riderEmails);

      order.orderNum = orderNum;
      order.save();

      res.json({
        status: '200',
        msg: 'Order successfully accepted',
      });

      const adminMessage = `The order number ${orderNum} has been Accepted by ${shop.name}`;
      orderStatusEmail(adminMessage);
    }

    if (status === 'Admin Accepted' && customerNotified) {
      const msg = `Dear ${user.name} your order# ${orderNum} for ${shop.name} is now ready. Kindly pick it up`;
      await notifyUser(msg, user.playerId, { flag: 'preparingOrder' });

      sendAcceptanceEmail(user.email !== '' ? user.email : '', msg);

      return res.json({
        status: '200',
        msg: 'Customer has been notified',
      });
    }

    if (status === 'Delivered') {
      const msg = `Dear ${user.name} thankyou for your order from ${shop.name}`;
      await notifyUser(msg, user.playerId, { flag: 'preparingOrder' });

      return res.json({
        status: '200',
        msg: 'Order successfully completed',
      });
    }
  } catch (err) {
    console.error(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/adminAcceptedOrders', async (req, res) => {
  try {
    const { riderId } = req.body;

    const [idleRiders, { status, name }] = await Promise.all([
      Users.find({ type: 'rider', status: 'idle', available: true }),

      Users.findById(riderId),
    ]);

    console.log(`${name} refreshed`);

    let acceptedOrders = [];

    if (idleRiders.length > 0) {
      if (status === 'idle') {
        acceptedOrders = await Orders.find({
          status: 'Admin Accepted',
          orderType: 'Delivery',
        })
          .sort({
            createdAt: -1,
          })
          .lean();
      }
    } else {
      acceptedOrders = await Orders.find({
        status: 'Admin Accepted',
        orderType: 'Delivery',
      })
        .sort({
          createdAt: -1,
        })
        .lean();
    }

    return res.json({
      status: '200',
      data: acceptedOrders,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/assignRider', async (req, res) => {
  try {
    const { orderId, riderName, riderId } = req.body;

    const [order, { tillNoonFare, nightFare }] = await Promise.all([
      Orders.findById(orderId),
      Users.findById(riderId),
    ]);

    if (order.riderId) {
      return res.json({
        status: '404',
        msg:
          'This order has already been assigned to another rider. Stay active another order might come your way.',
      });
    }

    const orderTime = moment(order.time, 'HH:mma')
      .tz('Asia/karachi')
      .subtract(5, 'hours');

    const morningFareTime = moment('04:00', 'HH:mm').tz('Asia/karachi');
    const noonFareTime = moment('16:00', 'HH:mm').tz('Asia/karachi');

    if (orderTime.isBetween(morningFareTime, noonFareTime)) {
      req.body.riderFare = tillNoonFare;
    } else {
      req.body.riderFare = nightFare;
    }

    await Promise.all([
      Orders.findByIdAndUpdate(orderId, { $set: req.body }),

      Users.findByIdAndUpdate(riderId, { status: 'on delivery' }),
    ]);

    res.json({
      status: '200',
      msg: 'This order is now assigned to you.',
    });

    const { playerIds } = await Mart.findById(order.martId);

    const message = `Dastak rider ${riderName} is assigned to order# ${order.orderNum}.`;
    const info = `${riderName} is assigned to an order for ${order.martName} placed by ${order.name}`;

    playerIds.forEach(async playerId => {
      await notifyAdmin(info, message, playerId, {
        flag: 'adminReceived',
      });
    });

    await orderStatusEmail(message);
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/riderOrders', async (req, res) => {
  try {
    const { riderId } = req.body;

    const [{ fareType }, accepted] = await Promise.all([
      Users.findById(riderId),

      Orders.find({
        riderId,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
      }).sort({
        createdAt: -1,
      }),
    ]);

    let delivered;

    if (fareType === 'salary') {
      delivered = await Orders.find({
        riderId,
        paidToRider: false,
        status: 'Delivered',
      }).sort({
        createdAt: -1,
      });
    } else {
      delivered = await Orders.find({
        riderId,
        paidToRider: false,
        riderFare: { $gt: 0 },
        status: 'Delivered',
      }).sort({
        createdAt: -1,
      });
    }

    const totalRidersFare = delivered.reduce((a, b) => a + b.riderFare, 0);
    const totalOrdersAmount = delivered.reduce((a, b) => a + b.orderTotal, 0);
    delivered = delivered.filter(order => order.reason === '');

    await Promise.all(
      accepted.map(async order => {
        const { martId } = order;

        const { latitude, longitude } = await Mart.findById(martId);

        order.martLatitude = latitude;
        order.martLongitude = longitude;
      })
    );

    return res.json({
      status: '200',
      accepted,
      delivered,
      totalOrdersAmount,
      totalRidersFare,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/changeOrderStatus', async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Orders.findByIdAndUpdate(orderId, { $set: req.body });

    if (status === 'Delivered') {
      const currentTime = moment().tz('Asia/karachi');
      const timeWhenDelivered = moment(currentTime, 'hh:mm').format('hh:mm a');
      order.timeWhenDelivered = timeWhenDelivered;
      order.save();

      const query = {
        riderId: order.riderId,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
      };

      const riderOrders = await Orders.countDocuments(query);

      if (riderOrders === 0) {
        await Users.findByIdAndUpdate(order.riderId, { status: 'idle' });
      }

      const message = `Order# ${order.orderNum} has been delivered by ${order.riderName}`;
      orderStatusEmail(message);

      return res.json({
        status: '202',
        msg: 'Order successfully delivered',
      });
    }

    res.json({ status: '200' });

    const user = await Users.findById(order.userId);

    const pickUpMsg =
      'Your order has been picked up by dastak rider and will be delivered to you shortly';

    if (user.type === 'admin') {
      const { playerIds } = await Mart.findById(order.userId);

      playerIds.forEach(async playerId => {
        await notifyUser(pickUpMsg, playerId, { flag: 'orderPickedUp' });
      });
    } else {
      const { playerId } = await Users.findById(order.userId);

      await notifyUser(pickUpMsg, playerId, { flag: 'orderPickedUp' });
    }

    const message = `Order# ${order.orderNum} has been picked up by ${order.riderName}`;
    orderStatusEmail(message);
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/paidToOwners', async (req, res) => {
  try {
    let { restaurants, startDate, endDate } = req.body;

    startDate = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    restaurants = JSON.parse(restaurants);

    const data = await Promise.all(
      restaurants.map(async martName => {
        const thisWeeksOrders = await Orders.find({
          martName,
          paid: { $in: [false, undefined] },
          orderType: 'Delivery',
          status: { $in: ['Delivered', 'Rider Picked Up'] },
          dateForSearching: {
            $gte: startDate,
            $lte: endDate,
          },
        });

        await Promise.all(
          thisWeeksOrders.map(async order => {
            order.paid = true;
            await order.save();
          })
        );

        const originalTotal = thisWeeksOrders.reduce(
          (a, b) => a + b.orderTotal,
          0
        );

        const totalWithoutDeliveryCharges = thisWeeksOrders.reduce(
          (a, b) =>
            b.deliveryCharges !== '0'
              ? a + b.orderTotal - 30
              : a + b.orderTotal,
          0
        );

        const totalDeliveryCharges =
          originalTotal - totalWithoutDeliveryCharges;

        const data = {
          martName,
          totalOrders: thisWeeksOrders.length,
          originalTotal,
          totalWithoutDeliveryCharges,
          totalDeliveryCharges,
          data: thisWeeksOrders,
        };

        return data;
      })
    );

    return res.json({
      status: '200',
      data,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/paidToRiders', async (req, res) => {
  try {
    let { riders, startDate, endDate } = req.body;
    let total = 0;

    startDate = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    riders = JSON.parse(riders);

    const data = await Promise.all(
      riders.map(async riderId => {
        const [{ name }, thisWeeksOrders] = await Promise.all([
          Users.findById(riderId),

          Orders.find({
            riderId,
            paidToRider: false,
            orderType: 'Delivery',
            status: { $in: ['Delivered', 'Rider Picked Up'] },
            dateForSearching: {
              $gte: startDate,
              $lte: endDate,
            },
          }),
        ]);

        await Promise.all(
          thisWeeksOrders.map(async order => {
            order.paidToRider = true;
            await order.save();
          })
        );

        total = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);
        const riderFare = thisWeeksOrders.reduce((a, b) => a + b.riderFare, 0);

        return {
          name,
          riderFare,
          thisWeeksOrders,
        };
      })
    );

    return res.json({
      status: '200',
      total,
      data,
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
