const express = require('express');

const router = express.Router();
const moment = require('moment-timezone');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');
const Mart = require('../../models/martsModel');

const notify = require('../../notificationHandler/handler');

const {
  emailOrderDetails,
} = require('../../emailHandler/orderEmail/orderEmail');
const {
  emailOrderDetailsToCustomer,
} = require('../../emailHandler/customerEmail/customerEmail');

router.post('/saveOrder', async (req, res) => {
  try {
    const params = req.body;
    const total = params.orderTotal;

    const mart = await Mart.findById({ _id: params.martId }).select(
      '-password -__v'
    );

    if (!mart.available) {
      return res.json({
        status: '404',
        msg: `Sorry the ${mart.shopType} is not available due to some reason`,
      });
    }

    const user = await Users.findById({ _id: params.userId }).select(
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

    res.json({
      status: '200',
      msg: `Order Received`,
      data: order,
    });

    let count = 0;
    params.products.map(p => {
      count += +p.count;
      return count;
    });

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

    if (openingTimeOffSet === 'pm' && closingTimeOffSet === 'am') {
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
    const { orderNum, reason, orderId, status, orderType, shopType } = req.body;
    const order = await Orders.findByIdAndUpdate(orderId, {
      $set: req.body,
    });

    const user = await Users.findById(order.userId);

    if (status === 'Rejected') {
      const msg = `Dear ${user.name} your order# ${orderNum} has not been accepted because ${shopType} is ${reason}`;

      await notify.user(msg, user.playerId, { flag: 'orderRejected' });

      order.reason = reason;
      order.save();
    }

    if (status === 'Accepted') {
      const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's dispatched.`;

      await notify.user(msg, user.playerId, { flag: 'preparingOrder' });
    }

    if (status === 'Delivered') {
      if (orderType === 'PickUp') {
        const customerMsg = `Dear ${user.name} your order number ${orderNum} is ready kindly collect your order as soon as possible.`;

        await notify.user(customerMsg, user.playerId, {
          flag: 'orderDelivered',
        });
      } else {
        const msg = `Dear ${user.name} your order# ${orderNum} has been dispatched and will arrive shortly.`;

        await notify.user(msg, user.playerId, { flag: 'orderDelivered' });
      }
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
