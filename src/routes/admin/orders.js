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

const {
  orderStatusEmail,
} = require('../../emailHandler/orderConfirmationEmail/orderStatusEmail');

router.post('/placeOrder', async (req, res) => {
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

    const adminMessage = 'You have a new order';

    await notify.admin(adminMessage, mart.playerId, { flag: 'adminReceived' });

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
      status: { $in: ['Admin Accepted', 'Rider Accepted'] },
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

router.post('/adminResponse', async (req, res) => {
  try {
    const { orderNum, reason, orderId, status, orderType, shopType } = req.body;

    const order = await Orders.findByIdAndUpdate(orderId, {
      $set: req.body,
    });

    const user = await Users.findById(order.userId);
    const shop = await Mart.findById(order.martId);

    const ridersMessage = `New order from ${shop.name}`;

    if (status === 'Rejected') {
      const msg = `Dear ${user.name} your order# ${orderNum} has been rejected by ${shopType} because ${reason}`;

      await notify.user(msg, user.playerId, { flag: 'orderRejected' });

      order.reason = reason;
      order.orderNum = orderNum;
      order.save();

      res.json({
        status: '200',
        msg: 'Order successfully rejected',
      });

      const adminMessage = `The order number ${orderNum} has been rejected by ${shop.name} because it's ${reason}`;
      orderStatusEmail(adminMessage);
    }

    if (status === 'Admin Accepted') {
      if (orderType === 'PickUp') {
        const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's ready.`;

        await notify.user(msg, user.playerId, { flag: 'preparingOrder' });

        const adminMessage = `The order number ${orderNum} has been accepted by ${shop.name}. It's a pick up order.`;
        orderStatusEmail(adminMessage);
      }

      const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's dispatched.`;

      await notify.user(msg, user.playerId, { flag: 'preparingOrder' });

      const availableRiders = await Users.find({
        type: 'rider',
        status: 'available',
      });

      if (availableRiders.length === 0) {
        const allRiders = await Users.find({ type: 'rider' });

        allRiders.map(async rider => {
          await notify.riders(ridersMessage, rider.playerId, {
            flag: 'riderNotified',
          });
        });
      }

      availableRiders.map(async rider => {
        await notify.riders(ridersMessage, rider.playerId, {
          flag: 'riderNotified',
        });
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
  } catch (err) {
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.get('/adminAcceptedOrders', async (req, res) => {
  try {
    const acceptedOrders = await Orders.find({
      status: 'Admin Accepted',
    }).sort({
      createdAt: -1,
    });

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
    const { orderId, riderId, riderName, riderPhone, status } = req.body;

    const order = await Orders.findById(orderId);
    const { playerId } = await Users.findById(order.martId);

    if (order.status === 'Rider Accepted')
      return res.json({
        status: '404',
        msg:
          'This order has already been assigned to another rider. Stay active another order might com your way',
      });

    order.riderId = riderId;
    order.riderName = riderName;
    order.riderPhone = riderPhone;
    order.status = status;
    order.save();

    res.json({
      status: '200',
      msg: 'This order is now assigned to you.',
    });

    const message = `Dastak rider ${riderName} is assigned to order# ${order.orderNum}.`;

    await notify.admin(message, playerId, {
      flag: 'riderAccepted',
    });

    orderStatusEmail(message);
  } catch (err) {
    console.log(err);
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

    const accepted = await Orders.find({
      riderId,
      status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
    }).sort({
      createdAt: -1,
    });

    const delivered = await Orders.find({
      riderId,
      status: 'Delivered',
    }).sort({
      createdAt: -1,
    });

    return res.json({
      status: '200',
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

router.post('/changeOrderStatus', async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Orders.findByIdAndUpdate(orderId, { $set: req.body });

    if (status === 'Delivered') {
      const message = `Order# ${order.orderNum} has been delivered by ${order.riderName}`;
      orderStatusEmail(message);

      return res.json({
        status: '202',
        msg: 'Order successfully delivered',
      });
    }

    res.json({ status: '200' });

    const { playerId } = await Users.findById(order.userId);

    const pickUpMsg =
      'Your order has been picked up by dastak rider and will be delivered to you shortly';

    await notify.user(pickUpMsg, playerId, { flag: 'orderPickedUp' });

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

module.exports = router;
