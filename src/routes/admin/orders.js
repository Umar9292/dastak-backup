const express = require('express');

const router = express.Router();
const moment = require('moment-timezone');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');
const Mart = require('../../models/martsModel');

const notify = require('../../notificationHandler/handler');

router.post('/saveOrder', async (req, res) => {
  try {
    const params = req.body;
    const total = params.orderTotal;

    const mart = await Mart.findById({ _id: params.martId }).select(
      '-password -__v'
    );

    const orderTime = moment().tz('Asia/karachi');
    const formatedTime = moment(orderTime, 'hh:mm').format('hh:mm a');

    if (+total < mart.minimumOrder) {
      return res.json({ msg: `Minimun order is Rs ${mart.minimumOrder}` });
    }

    params.products = await JSON.parse(params.products);
    params.martId = mart._id;
    params.martName = mart.name;
    params.martPhone = mart.phone;
    params.martAddress = mart.address;
    params.time = formatedTime;

    const order = await new Orders(params).save();

    await notify.admin(mart.playerId, { flag: 'orderReceived' });

    return res.json({
      status: '200',
      msg: `Order Received`,
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

router.post('/checkTime', async (req, res) => {
  try {
    const params = req.body;

    const shop = await Mart.findById({ _id: params.martId }).select(
      '-password -__v'
    );

    const formatedOrderTime = moment()
      .tz('Asia/karachi')
      .format('HH:mma');

    const orderTime = moment(formatedOrderTime, 'HH:mma');
    const openingTime = moment(shop.openingTime, 'HH:mma').tz('Asia/karachi');
    let closingTime = moment(shop.closingTime, 'HH:mma').tz('Asia/karachi');
    const openingTimeOffSet = moment(openingTime).format('a');
    const closingTimeOffSet = moment(closingTime).format('a');

    if (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') {
      closingTime = moment(closingTime).add(1, 'days');
    }

    if (orderTime.isAfter(openingTime) && orderTime.isBefore(closingTime)) {
      return res.json({ status: '200' });
    }

    if (shop.shopType === 'mart') {
      const currentDate = moment()
        .tz('Asia/karachi')
        .format('DD-MM-YYYY');
      const nextDate = moment(currentDate, 'DD-MM-YYYY')
        .add(1, 'days')
        .format('DD-MM-YYYY');

      return res.json({
        status: '204',
        msg: `You are placing an order for tomorrow, you will received your order on ${nextDate}`,
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

/* router.post('/checkTime', async (req, res) => {
  try {
    const params = req.body;

    const shop = await Mart.findById({ _id: params.martId }).select(
      '-password -__v'
    );
    console.log('!......................! \n');
    const formatedOrderTime = moment()
      .tz('Asia/karachi')
      .format('HH:mma');
    console.log(formatedOrderTime);
    let orderTime = moment(formatedOrderTime, 'HH:mma');
    orderTime = moment(orderTime).add(1, 'days');
    orderTime = moment(orderTime).subtract(13, 'hours');
    const orderTimeOffSet = moment(orderTime).format('a');

    console.log('Order time: ', orderTime);

    let openingTime = moment(shop.openingTime, 'HH:mma').tz('Asia/karachi');
    openingTime = moment(openingTime).add(1, 'days');

    let closingTime = moment(shop.closingTime, 'HH:mma').tz('Asia/karachi');
    closingTime = moment(closingTime).add(1, 'days');

    const openingTimeOffSet = moment(openingTime).format('a');
    const closingTimeOffSet = moment(closingTime).format('a');
    console.log(openingTimeOffSet, closingTimeOffSet, orderTimeOffSet);
    if (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') {
      closingTime = moment(closingTime).add(1, 'days');
    }

    console.log('Opening time: ', openingTime);
    console.log('Closing time: ', closingTime);

    if (orderTime.isAfter(openingTime) && orderTime.isBefore(closingTime)) {
      return res.json({ status: '200' });
    }

    if (shop.shopType === 'mart') {
      const currentDate = moment()
        .tz('Asia/karachi')
        .format('DD-MM-YYYY');

      const nextDate = moment(currentDate, 'DD-MM-YYYY')
        .add(1, 'days')
        .format('DD-MM-YYYY');

      return res.json({
        status: '204',
        msg: `You are placing an order for tomorrow, you will received your order on ${nextDate}`,
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
}); */

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
      status: 'Accepted',
    }).sort({
      createdAt: -1,
    });

    const delivered = await Orders.find({
      martId: req.body.martId,
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

router.post('/changeOrderStatus', async (req, res) => {
  try {
    const order = await Orders.findByIdAndUpdate(req.body.orderId, {
      $set: req.body,
    });

    const user = await Users.findById(order.userId);

    if (req.body.status === 'Rejected') {
      const msg = `Dear ${user.name} your order# ${req.body.orderNum} has not been accepted because the ${user.type} is ${req.body.reason}`;

      await notify.user(msg, user.playerId, { flag: 'orderCancelled' });

      order.reason = req.body.reason;
      order.save();
    }

    if (req.body.status === 'Accepted') {
      const msg = `Dear ${user.name} your order# ${req.body.orderNum} is being prepared. WE'll notify you once it's dispatched.`;

      await notify.user(msg, user.playerId, { flag: 'preparingOrder' });
    }

    if (req.body.status === 'Delivered') {
      const msg = `Dear ${user.name} your order# ${req.body.orderNum} has been dispatched and will arrive in approximately 30 mins.`;

      await notify.user(msg, user.playerId, { flag: 'orderShipped' });
    }

    return res.json({
      status: '200',
      msg: 'Order status updated',
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
