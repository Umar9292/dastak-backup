import { Router } from 'express';
import moment from 'moment-timezone';

import Orders from '../../models/ordersModel';
import Users from '../../models/userModel';
import Mart from '../../models/martsModel';
import { emailOrderDetailsToCustomer } from '../../emailHandler/customerEmail/customerEmail';
import { orderStatusEmail } from '../../emailHandler/orderConfirmationEmail/orderStatusEmail';
import { emailOrderDetailsToRider } from '../../emailHandler/riderEmail/riderEmail';
import {
  emailOrderDetails,
  notifyRestaurantByEmail,
} from '../../emailHandler/orderEmail/orderEmail';
import {
  notifyUser,
  notifyAdmin,
  notifyRiders,
} from '../../notificationHandler/handler';

const router = Router();

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

    const morningFareStart = moment('09:00', 'HH:mm:ssa').tz('Asia/karachi');
    const morningFareEnd = moment('14:00', 'HH:mm:ssa').tz('Asia/karachi');
    const nightFareStart = moment('21:00', 'HH:mm:ssa').tz('Asia/karachi');
    const nightFareSEnd = moment('23:59', 'HH:mm:ssa').tz('Asia/karachi');

    const morningFareStartTime = moment(morningFareStart).subtract(5, 'hours');
    const morningFareEndTime = moment(morningFareEnd).subtract(5, 'hours');
    const nightFareStartTime = moment(nightFareStart).subtract(5, 'hours');
    const nightFareEndTime = moment(nightFareSEnd).subtract(5, 'hours');

    if (
      orderTime.isBetween(
        `${morningFareStartTime.toISOString()}`,
        `${morningFareEndTime.toISOString()}`
      )
    ) {
      params.riderFare = 100;
    } else if (
      orderTime.isBetween(
        `${nightFareStartTime.toISOString()}`,
        `${nightFareEndTime.toISOString()}`
      )
    ) {
      params.riderFare = 100;
    } else {
      params.riderFare = 70;
    }

    const order = await new Orders(params).save();

    const adminMessage = 'You have a new order';
    const info = `An order is placed to ${params.martName}`;

    const { playerIds } = mart;

    playerIds.forEach(async playerId => {
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

    if (mart.email && mart.email !== '') {
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

    if (user.email) {
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
        msg: `${name} has been closed. You can still place your order but it will be entertained after it opens at ${shop.openingTime}`,
      });
    }

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
      Orders.find({ martId, status: 'Pending' }).sort({ createdAt: -1 }),

      Orders.find({
        martId,
        status: {
          $in: ['Admin Accepted', 'Rider Accepted', 'Rider Picked Up'],
        },
      }).sort({ createdAt: -1 }),

      Orders.find({
        martId,
        paid: { $in: [false, undefined] },
        status: 'Delivered',
      }).sort({
        createdAt: -1,
      }),
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

    const order = await Orders.findByIdAndUpdate(orderId, {
      $set: req.body,
    });

    const [user, shop] = await Promise.all([
      Users.findById(order.userId),
      Mart.findById(order.martId),
    ]);

    const ridersMessage = `New order from ${shop.name}`;

    if (status === 'Rejected') {
      const msg = `Dear ${user.name} your order# ${orderNum} could not be accepted by ${shopType} because ${reason}`;

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
            await notifyUser(msg, playerId, { flag: 'orderRejected' });
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

      const idleRiders = await Users.find({
        type: 'rider',
        status: 'idle',
        available: true,
      });

      const allRiders = await Users.find({ type: 'rider', available: true });

      if (idleRiders.length === 0) {
        allRiders.forEach(async rider => {
          await notifyRiders(ridersMessage, rider.playerId, {
            flag: 'riderNotified',
          });

          emailOrderDetailsToRider(rider.email);
        });
      }

      idleRiders.forEach(async rider => {
        await notifyRiders(ridersMessage, rider.playerId, {
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
      await notifyUser(msg, user.playerId, { flag: 'preparingOrder' });

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

    const [idleRiders, { status }] = await Promise.all([
      Users.find({ type: 'rider', status: 'idle', available: true }),

      Users.findById(riderId),
    ]);

    let acceptedOrders = [];

    if (idleRiders.length > 0) {
      if (status === 'idle') {
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

    await Promise.all([
      Orders.findByIdAndUpdate(orderId, { $set: req.body }),

      Users.findByIdAndUpdate(riderId, {
        status: 'on delivery',
      }),
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

router.post('/paidToOwner', async (req, res) => {
  try {
    let { martName, startDate, endDate, percentage } = req.body;
    const thisWeeksOrders = [];

    const orders = await Orders.find({
      martName,
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

    const originalTotal = thisWeeksOrders.reduce((a, b) => a + b.orderTotal, 0);

    const totalWithoutDeliveryCharges = thisWeeksOrders.reduce(
      (a, b) =>
        b.deliveryCharges !== '0' ? a + b.orderTotal - 30 : a + b.orderTotal,
      0
    );

    const ourProfit = (
      (percentage / 100) *
      totalWithoutDeliveryCharges
    ).toFixed();

    const totalDeliveryCharges = originalTotal - totalWithoutDeliveryCharges;

    const totalToPayOwner = totalWithoutDeliveryCharges - +ourProfit;

    return res.json({
      totalOrders: thisWeeksOrders.length,
      originalTotal,
      totalWithoutDeliveryCharges,
      totalDeliveryCharges,
      totalToPayOwner,
      ourProfit,
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

export default router;
