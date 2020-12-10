const express = require('express');

const router = express.Router();
const moment = require('moment-timezone');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');
const Mart = require('../../models/martsModel');

const notify = require('../../notificationHandler/handler');

const {
  emailOrderDetails,
  notifyRestaurantByEmail,
} = require('../../emailHandler/orderEmail/orderEmail');
const {
  emailOrderDetailsToCustomer,
} = require('../../emailHandler/customerEmail/customerEmail');
const {
  orderStatusEmail,
} = require('../../emailHandler/orderConfirmationEmail/orderStatusEmail');
const {
  emailOrderDetailsToRider,
} = require('../../emailHandler/riderEmail/riderEmail');

router.post('/placeOrder', async (req, res) => {
  try {
    const params = req.body;
    const { orderTotal, martId, userId, products } = params;

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

    params.products = await JSON.parse(products);
    params.martId = mart._id;
    params.martName = mart.name;
    params.martPhone = mart.phone;
    params.martAddress = mart.martAddress;
    params.time = formatedTime;

    const formatedStartTime = moment('21:00', 'HH:mm:ssa').tz('Asia/karachi');
    const formatedEndTime = moment('23:59', 'HH:mm:ssa').tz('Asia/karachi');

    const specialFareStartTime = moment(formatedStartTime).subtract(5, 'hours');
    const specialFareEndTime = moment(formatedEndTime).subtract(5, 'hours');

    if (
      orderTime.isBetween(
        `${specialFareStartTime.toISOString()}`,
        `${specialFareEndTime.toISOString()}`
      )
    ) {
      params.riderFare = 80;
    } else {
      params.riderFare = 50;
    }

    const order = await new Orders(params).save();

    const adminMessage = 'You have a new order';

    const { playerIds } = mart;

    playerIds.forEach(async playerId => {
      await notify.admin(adminMessage, playerId, {
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

    notifyRestaurantByEmail(mart.email);

    emailOrderDetails(
      mart,
      user,
      formatedTime,
      params.address,
      params.products,
      count,
      params.orderTotal
    );

    emailOrderDetailsToCustomer(
      user,
      mart,
      params.date,
      params.orderTotal,
      params.address,
      params.products,
      count
    );
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/checkTime', async (req, res) => {
  try {
    const params = req.body;

    const shop = await Mart.findById({ _id: params.martId }).select(
      '-password -__v'
    );

    const orderTime = moment().tz('Asia/karachi');

    const formatedOpeningTime = moment(shop.openingTime, 'HH:mm:ssa').tz(
      'Asia/karachi'
    );
    const formatedClosingTime = moment(shop.closingTime, 'HH:mm:ssa').tz(
      'Asia/karachi'
    );

    const openingTime = moment(formatedOpeningTime).subtract(5, 'hours');
    let closingTime = moment(formatedClosingTime).subtract(5, 'hours');

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

    if (shop.shopType === 'mart') {
      return res.json({
        status: '204',
        msg: `${shop.name} has been closed. You can still place your order but it will be entertained after it opens at ${shop.openingTime}`,
      });
    }

    if (shop.shopType === 'restaurant') {
      return res.json({
        status: '404',
        msg: `${shop.name} is closed`,
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

router.post('/allOrders', async (req, res) => {
  try {
    const upcoming = await Orders.find({
      martId: req.body.martId,
      status: 'Pending',
    }).sort({
      createdAt: -1,
    });

    const accepted = await Orders.find({
      martId: req.body.martId,
      status: { $in: ['Admin Accepted', 'Rider Accepted'] },
    }).sort({
      createdAt: -1,
    });

    const delivered = await Orders.find({
      martId: req.body.martId,
      paid: { $in: [false, undefined] },
      status: 'Delivered',
    }).sort({
      createdAt: -1,
    });

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
    const orders = await Orders.find({ userId: req.body.userId }).sort({
      createdAt: -1,
    });

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
      shopType,
      customerNotified,
    } = req.body;
    console.log(req.body);
    const order = await Orders.findByIdAndUpdate(orderId, {
      $set: req.body,
    });

    const user = await Users.findById(order.userId);
    const shop = await Mart.findById(order.martId);

    const ridersMessage = `New order from ${shop.name}`;

    if (status === 'Rejected') {
      const msg = `Dear ${user.name} your order# ${orderNum} has been rejected by ${shopType} because ${reason}`;

      if (user.type === 'admin') {
        const { playerIds } = shop;

        playerIds.forEach(async playerId => {
          await notify.user(msg, playerId, { flag: 'orderRejected' });
        });
      } else {
        await notify.user(msg, user.playerId, { flag: 'orderRejected' });
      }

      order.reason = reason;
      order.orderNum = orderNum;
      order.save();

      const adminMessage = `The order number ${orderNum} has been rejected by ${shop.name} because it's ${reason}`;
      orderStatusEmail(adminMessage);

      return res.json({
        status: '200',
        msg: 'Order successfully rejected',
      });
    }

    if (status === 'Admin Accepted' && !customerNotified) {
      if (orderType === 'PickUp') {
        const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's ready.`;

        if (user.type === 'admin') {
          const { playerIds } = user;

          playerIds.forEach(async playerId => {
            await notify.user(msg, playerId, { flag: 'orderRejected' });
          });
        } else {
          await notify.user(msg, user.playerId, { flag: 'preparingOrder' });
        }

        const adminMessage = `The order number ${orderNum} has been accepted by ${shop.name}. It's a pick up order.`;
        orderStatusEmail(adminMessage);

        return res.json({
          status: '200',
          msg: 'Order successfully accepted',
        });
      }

      const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's dispatched.`;

      await notify.user(msg, user.playerId, { flag: 'preparingOrder' });

      const availableRiders = await Users.find({
        type: 'rider',
        status: 'idle',
        available: true,
      });

      if (availableRiders.length === 0) {
        const allRiders = await Users.find({ type: 'rider', available: true });

        allRiders.map(async rider => {
          await notify.riders(ridersMessage, rider.playerId, {
            flag: 'riderNotified',
          });

          emailOrderDetailsToRider(rider.email);
        });
      }

      availableRiders.map(async rider => {
        await notify.riders(ridersMessage, rider.playerId, {
          flag: 'riderNotified',
        });

        emailOrderDetailsToRider(rider.email);
      });

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
      await notify.user(msg, user.playerId, { flag: 'preparingOrder' });

      return res.json({
        status: '200',
        msg: 'Customer has been notified',
      });
    }

    if (status === 'Delivered') {
      const msg = `Dear ${user.name} thankyou for your order from ${shop.name}`;
      await notify.user(msg, user.playerId, { flag: 'preparingOrder' });

      return res.json({
        status: '200',
        msg: 'Order successfully completed',
      });
    }
  } catch (err) {
    console.log(err);
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

    const idleRiders = await Users.find({
      type: 'rider',
      status: 'idle',
      available: true,
    });

    const rider = await Users.findById(riderId);

    let acceptedOrders = [];

    if (idleRiders.length > 0) {
      if (rider.status === 'idle') {
        acceptedOrders = await Orders.find({
          status: 'Admin Accepted',
          orderType: 'Delivery',
        }).sort({
          createdAt: -1,
        });
      }
    } else {
      acceptedOrders = await Orders.find({
        status: 'Admin Accepted',
        orderType: 'Delivery',
      }).sort({
        createdAt: -1,
      });
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

    const order = await Orders.findById(orderId);

    if (order.riderId)
      return res.json({
        status: '404',
        msg:
          'This order has already been assigned to another rider. Stay active another order might come your way.',
      });

    await Orders.findByIdAndUpdate(orderId, { $set: req.body });

    await Users.findByIdAndUpdate(riderId, {
      status: 'on delivery',
    });

    res.json({
      status: '200',
      msg: 'This order is now assigned to you.',
    });

    const { playerIds } = await Mart.findById(order.martId);

    const message = `Dastak rider ${riderName} is assigned to order# ${order.orderNum}.`;

    playerIds.forEach(async playerId => {
      await notify.admin(message, playerId, {
        flag: 'adminReceived',
      });
    });

    orderStatusEmail(message);
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

    const { fareType } = await Users.findById(riderId);

    let delivered;

    const accepted = await Orders.find({
      riderId,
      status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
    }).sort({
      createdAt: -1,
    });

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

    delivered = delivered.filter(order => order.reason === '');

    const totalOrdersAmount = delivered.reduce((a, b) => a + b.orderTotal, 0);

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
      const query = {
        riderId: order.riderId,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
      };

      const riderOrders = await Orders.find(query);

      if (riderOrders.length === 0) {
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
        await notify.user(pickUpMsg, playerId, { flag: 'orderPickedUp' });
      });
    } else {
      const { playerId } = await Users.findById(order.userId);

      await notify.user(pickUpMsg, playerId, { flag: 'orderPickedUp' });
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

router.post('/paidToOwner', async (req, res) => {
  try {
    let { martId, startDate, endDate } = req.body;
    const thisWeeksOrders = [];

    const orders = await Orders.find({
      martId,
      paid: { $in: [false, undefined] },
      orderType: 'Delivery',
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
          // order.paid = true;
          // await order.save();
        }
      })
    );

    const total = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);

    return res.json({
      total,
      status: '200',
      data: thisWeeksOrders,
    });
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/paidToRider', async (req, res) => {
  try {
    let { riderId, startDate, endDate } = req.body;
    const thisWeeksOrders = [];

    const orders = await Orders.find({
      riderId,
      paidToRider: false,
      orderType: 'Delivery',
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
          // order.paidToRider = true;
          // await order.save();
        }
      })
    );

    const total = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);

    const riderFare = thisWeeksOrders.reduce((a, b) => a + b.riderFare, 0);

    return res.json({
      total,
      status: '200',
      data: thisWeeksOrders,
      riderFare,
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
