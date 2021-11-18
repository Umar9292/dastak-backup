const Router = require('express/lib/router');
const axios = require('axios');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');

const { getAddress } = require('../../geoCoder/getAddress');
const {
  orderStatusEmail,
} = require('../../emailHandler/orderConfirmationEmail/orderStatusEmail');
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
    const {
      orderTotal,
      martId,
      userId,
      products,
      latitude,
      longitude,
      orderType,
      deliveryCharges,
    } = params;

    const date = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const [mart, { employee }, todaysOrders] = await Promise.all([
      Users.findById(martId)
        .select('-password -__v')
        .lean(),

      Users.findById(userId)
        .select('employee')
        .lean(),

      Orders.countDocuments({ martId, date }),
    ]);

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

    if (params.address === 'Current Location') {
      params.address = await getAddress(latitude, longitude);
    }

    params = {
      ...params,
      products: await JSON.parse(products),
      city: mart.city,
      martId: mart._id,
      martName: mart.name,
      martPhone: mart.phone,
      martAddress: mart.martAddress,
      time: formatedTime,
      deliveryCharges: employee !== undefined ? '0' : deliveryCharges,
      date,
      orderNum: todaysOrders + 1,
      orderTotal:
        employee !== undefined && orderType !== 'PickUp'
          ? orderTotal - deliveryCharges
          : orderTotal,
      dateForSearching: moment(date, 'DD-MM-YYYY')
        .tz('Asia/Karachi')
        .toISOString(),
    };

    const order = await new Orders(params).save();

    const adminMessage = `You have a new order from ${mart.city}`;
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

    /*  const msg = 'You have a new order.';
    await axios.get(
      `${process.env.SMS_URL}&mobile=${mart.phone}&message=${msg}`
    ); */

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
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/checkTime', async (req, res) => {
  try {
    const { martId, userId } = req.body;

    const orderTime = moment().tz('Asia/karachi');

    let { openingTime, closingTime, shopType, name } = await Users.findById(
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

    if (!userId || userId === '') {
      console.log(`${name} is closed`);
    } else {
      const { name: userName } = await Users.findById(userId).select('name');
      console.log(`${userName} ordered but ${name} is closed`);
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

    const [{ percentage }, upcoming, accepted, delivered] = await Promise.all([
      Users.findById(martId)
        .select('percentage')
        .lean(),

      Orders.find({ status: 'Pending', martId })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({
        status: {
          $in: ['Admin Accepted', 'Rider Accepted', 'Rider Picked Up'],
        },
        martId,
      })
        .sort({ createdAt: -1 })
        .lean(),

      Orders.find({
        paid: false,
        status: 'Delivered',
        martId,
      })
        .sort({
          createdAt: -1,
        })
        .lean(),
    ]);

    let dealPayment = 0;
    let nonDealPayment = 0;
    let ourProfit = 0;
    let pickUpPercentage = 0;
    let dealPaymentForRestaurant = 0;

    await Promise.all(
      delivered.map(async ({ products, orderType }) => {
        await Promise.all(
          products.map(async product => {
            const { net, count } = product;

            if (orderType === 'Delivery' && product.actualPrice === undefined) {
              nonDealPayment += net;
            }

            if (product.actualPrice === undefined && orderType === 'PickUp') {
              const ourPercentage = +((percentage / 100) * net).toFixed();
              pickUpPercentage += ourPercentage;
            }

            if (product.actualPrice !== undefined) {
              const priceDifference = net - product.actualPrice * count;

              if (orderType === 'PickUp') {
                ourProfit += priceDifference;
              } else {
                dealPayment += product.net;
                dealPaymentForRestaurant += product.actualPrice * count;
                ourProfit += priceDifference;
              }
            }
          })
        );
      })
    );

    const ourPercentage = +((percentage / 100) * nonDealPayment).toFixed();
    const totalToPay =
      dealPayment +
      (nonDealPayment - ourPercentage - ourProfit - pickUpPercentage);

    nonDealPayment = nonDealPayment - ourPercentage - pickUpPercentage;

    return res.json({
      status: '200',
      upcoming,
      accepted,
      delivered,
      dealPayment: dealPaymentForRestaurant,
      nonDealPayment,
      totalToPay,
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
      type,
      reason,
      orderId,
      status,
      orderType,
      customerNotified,
    } = req.body;

    const { status: orderStatus } = await Orders.findById(orderId)
      .select('status')
      .lean();

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

    if (status === 'Delivered') {
      return res.json({
        status: '200',
        msg: 'Order completed.',
      });
    }

    const [user, shop] = await Promise.all([
      Users.findById(order.userId),

      Users.findById(order.martId)
        .select('name shopType playerIds')
        .lean(),
    ]);

    const ridersMessage = `New order from ${shop.name}`;
    const otpPhone = 92 + user.phone.substring(1, 11);

    if (status === 'Rejected') {
      if (type !== undefined && type === 'user') {
        const msg = `Order# ${order.orderNum} has been cancelled.`;

        const { playerIds } = shop;

        playerIds.forEach(async playerId => {
          await notifyUser(msg, playerId, { flag: 'orderRejected' });
        });

        if (order.riderId) {
          const { playerId: ridersPlayerId } = await Users.findById(
            order.riderId
          )
            .select('playerId')
            .lean();

          await notifyUser(msg, ridersPlayerId, { flag: 'orderRejected' });
        }
      } else {
        let msg;
        if (orderStatus !== 'Pending') {
          msg = `Dear ${user.name} your order# ${orderNum} has been cancelled.`;
        } else {
          msg = `Dear ${user.name} your order# ${orderNum} could not be accepted by ${shop.shopType} because ${reason}`;
        }

        await axios.get(
          `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
            msg
          )}`
        );

        if (user.type === 'admin') {
          const { playerIds } = shop;

          playerIds.forEach(async playerId => {
            await notifyUser(msg, playerId, { flag: 'orderRejected' });
          });
        } else {
          await notifyUser(msg, user.playerId, { flag: 'orderRejected' });
        }

        const adminMessage = `The order number ${orderNum} has been rejected by ${shop.name} because it's ${reason}`;
        orderStatusEmail(adminMessage);
      }

      order.reason = reason;
      order.orderNum = orderNum;
      await order.save();

      res.json({
        status: '200',
        msg: 'Order successfully cancelled',
      });

      if (order.riderId) {
        const ongoingOrders = await Orders.countDocuments({
          riderId: order.riderId,
          status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
        });

        if (ongoingOrders === 0) {
          await Users.findByIdAndUpdate(order.riderId, { status: 'idle' });
        }

        const rider = await Users.findById(order.riderId).select('orderCount');
        rider.orderCount -= 1;
        await rider.save();
      }
    }

    if (status === 'Admin Accepted' && !customerNotified) {
      if (orderType === 'PickUp') {
        const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's ready.`;

        if (user.type === 'admin') {
          const { playerIds } = user;

          playerIds.forEach(async playerId => {
            await notifyUser(msg, playerId, { flag: 'preparingOrder' });
          });
        } else {
          await notifyUser(msg, user.playerId, { flag: 'preparingOrder' });
        }

        await axios.get(
          `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
            msg
          )}`
        );

        return res.json({
          status: '200',
          msg: 'Order successfully accepted',
        });
      }

      const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's dispatched.`;
      await notifyUser(msg, user.playerId, { flag: 'preparingOrder' });

      const [idleRiders, allRiders] = await Promise.all([
        Users.find({
          type: 'rider',
          status: 'idle',
          available: true,
          city: order.city,
        })
          .select('name playerId')
          .lean(),

        Users.find({
          type: 'rider',
          available: true,
          city: order.city,
        })
          .select('name playerId')
          .lean(),
      ]);

      if (idleRiders.length === 0) {
        allRiders.forEach(async rider => {
          const { name, playerId } = rider;

          await notifyRiders(name, ridersMessage, playerId, {
            flag: 'riderNotified',
          });
        });
      } else {
        idleRiders.forEach(async rider => {
          const { name, playerId } = rider;

          await notifyRiders(name, ridersMessage, playerId, {
            flag: 'riderNotified',
          });
        });
      }

      order.orderNum = orderNum;
      order.save();

      res.json({
        status: '200',
        msg: 'Order successfully accepted',
      });

      await axios.get(
        `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
          msg
        )}`
      );

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
    // Todo: Change this api, availbe and city should come from front end
    const { riderId } = req.body;
    let acceptedOrders = [];

    const { name, available, city, status } = await Users.findById(riderId)
      .select('name available city status')
      .lean();

    console.log(`${name} refreshed`);

    if (!available) {
      return res.json({
        status: '404',
        msg:
          'Kindly make your self available by clicking the button on the bottom right.',
      });
    }

    const idleRiders = await Users.countDocuments({
      type: 'rider',
      status: 'idle',
      available: true,
      city,
    });

    if (idleRiders > 0) {
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
    const { orderId, riderName, riderId, admin } = req.body;

    const currentDate = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const previousDate = moment()
      .tz('Asia/Karachi')
      .subtract(1, 'days')
      .format('DD-MM-YYYY');

    const time = moment().tz('Asia/Karachi');
    const hour = moment(time).format('H');

    let depositTimeUpperLimit = moment('09:00', 'HH:mm')
      .tz('Asia/Karachi')
      .subtract(5, 'hours');
    let depositTimeLowerLimit = moment('03:00', 'HH:mm')
      .tz('Asia/Karachi')
      .subtract(5, 'hours');

    if (+hour <= 3) {
      depositTimeLowerLimit = moment(depositTimeLowerLimit).add(1, 'days');
      depositTimeUpperLimit = moment(depositTimeUpperLimit).add(1, 'days');
    }

    const [order, rider, currentDateOrders] = await Promise.all([
      Orders.findById(orderId),

      Users.findById(riderId)
        .select(
          'tillNoonFare nightFare lateNightFare pendingCollection name paymentLimit orderCount'
        )
        .lean(),

      Orders.find({
        collectionSubmitted: false,
        status: 'Delivered',
        date: currentDate,
        riderId,
      })
        .select('orderTotal time')
        .lean(),
    ]);

    const {
      tillNoonFare,
      nightFare,
      lateNightFare,
      pendingCollection,
      name,
      paymentLimit,
      orderCount,
    } = rider;

    if (pendingCollection >= paymentLimit) {
      return res.json({
        status: '404',
        msg: `Dear ${name} your collection limit has been exceeded. Kindly deposit the previous amount to accept any further orders.`,
      });
    }

    if (order.riderId) {
      return res.json({
        status: '404',
        msg:
          'This order has already been assigned to another rider. Stay active another order might come your way.',
      });
    }

    if (admin === undefined && orderCount >= 2) {
      return res.json({
        status: '404',
        msg:
          'You cannot accept this order untill you deliver your previous orders.',
      });
    }

    if (time.isSameOrAfter(depositTimeUpperLimit)) {
      const filteredOrders = currentDateOrders.filter(order => {
        const orderTime = moment(order.time, 'HH:mm a')
          .tz('Asia/Karachi')
          .subtract(5, 'hours');

        if (orderTime.isAfter(depositTimeUpperLimit)) {
          return order;
        }
      });

      const sumOfFilteredOrders = filteredOrders.reduce(
        (a, b) => a + b.orderTotal,
        0
      );

      const remainder = sumOfFilteredOrders - pendingCollection;
      if (remainder !== 0) {
        return res.json({
          status: '404',
          msg: `Dear ${name} your collection limit has been exceeded. Kindly deposit the previous amount to accept any further orders.`,
        });
      }
    }

    if (time.isSameOrBefore(depositTimeLowerLimit)) {
      const previousDateOrders = await Orders.find({
        riderId,
        date: previousDate,
        status: 'Delivered',
        collectionSubmitted: false,
      })
        .select('orderTotal time')
        .lean();

      const previousDatefilteredOrders = previousDateOrders.filter(order => {
        let orderTime = moment(order.time, 'HH:mm a')
          .tz('Asia/Karachi')
          .subtract(5, 'hours');

        if (+hour <= 3) {
          orderTime = moment(orderTime).add(1, 'days');
        }

        if (orderTime.isSameOrAfter(depositTimeUpperLimit)) {
          return order;
        }
      });

      const sumOfCurrentDateOrders = currentDateOrders.reduce(
        (a, b) => a + b.orderTotal,
        0
      );

      const sumOfPreviousDateOrders = previousDatefilteredOrders.reduce(
        (a, b) => a + b.orderTotal,
        0
      );

      const remainder =
        sumOfCurrentDateOrders + sumOfPreviousDateOrders - pendingCollection;

      if (remainder !== 0) {
        return res.json({
          status: '404',
          msg: `Dear ${name} your collection limit has been exceeded. Kindly deposit the previous amount to accept any further orders.`,
        });
      }
    }

    if (admin === undefined) {
      order.assignedBy = name;
    } else {
      order.assignedBy = 'admin';
    }

    const orderTime = moment(order.time, 'HH:mma')
      .tz('Asia/karachi')
      .subtract(5, 'hours');

    const morningFareTime = moment('04:00', 'HH:mm').tz('Asia/karachi');
    const noonFareTime = moment('16:00', 'HH:mm').tz('Asia/karachi');
    const lateNightFareTime = moment('19:00', 'HH:mm').tz('Asia/karachi');

    if (orderTime.isBetween(morningFareTime, noonFareTime)) {
      req.body.riderFare = tillNoonFare;
    } else if (orderTime.isBetween(noonFareTime, lateNightFareTime)) {
      req.body.riderFare = nightFare;
    } else {
      req.body.riderFare = lateNightFare;
    }

    await Promise.all([
      Orders.findByIdAndUpdate(orderId, { $set: req.body }),

      Users.findByIdAndUpdate(riderId, {
        status: 'on delivery',
        orderCount: orderCount + 1,
      }),
    ]);

    res.json({
      status: '200',
      msg: 'This order is now assigned to you.',
    });

    await order.save();

    const { playerIds } = await Users.findById(order.martId);

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

/* router.post('/assignRider', async (req, res) => {
  try {
    const { orderId, riderName, riderId, admin } = req.body;

    const date = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const [
      order,
      {
        tillNoonFare,
        nightFare,
        pendingCollection,
        name,
        paymentLimit,
        orderCount,
      },
      todaysOrders,
    ] = await Promise.all([
      Orders.findById(orderId),

      Users.findById(riderId)
        .select(
          'tillNoonFare nightFare pendingCollection name paymentLimit orderCount'
        )
        .lean(),

      Orders.find({ riderId, date, status: 'Delivered' })
        .select('orderTotal')
        .lean(),
    ]);

    if (
      pendingCollection >= paymentLimit ||
      (todaysOrders.length === 0 && pendingCollection > 0)
    ) {
      return res.json({
        status: '404',
        msg: `Dear ${name} your collection limit has been exceeded. Kindly deposit the previous amount to accept any further orders.`,
      });
    }

    if (order.riderId) {
      return res.json({
        status: '404',
        msg:
          'This order has already been assigned to another rider. Stay active another order might come your way.',
      });
    }

    if (!admin && orderCount >= 2) {
      return res.json({
        status: '404',
        msg:
          'You cannot accept this order untill you deliver your previous orders.',
      });
    }

    if (!admin) {
      order.assignedBy = name;
    } else {
      order.assignedBy = 'admin';
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

      Users.findByIdAndUpdate(riderId, {
        status: 'on delivery',
        orderCount: orderCount + 1,
      }),
    ]);

    res.json({
      status: '200',
      msg: 'This order is now assigned to you.',
    });

    await order.save();

    const { playerIds } = await Users.findById(order.martId);

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
}); */

router.post('/riderOrders', async (req, res) => {
  try {
    const { riderId } = req.body;

    const [{ fareType, pendingCollection }, accepted] = await Promise.all([
      Users.findById(riderId).lean(),

      Orders.find({
        riderId,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
      })
        .sort({
          createdAt: -1,
        })
        .lean(),
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
      })
        .sort({
          createdAt: -1,
        })
        .lean();
    }

    const totalRidersFare = delivered.reduce((a, b) => a + b.riderFare, 0);
    const totalOrdersAmount = pendingCollection;
    delivered = delivered.filter(order => order.reason === '');

    await Promise.all(
      accepted.map(async order => {
        const { martId } = order;

        const { geometry } = await Users.findById(martId)
          .select('geometry')
          .lean();

        const [longitude, latitude] = geometry.coordinates;
        order.martLatitude = latitude.toString();
        order.martLongitude = longitude.toString();
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

    const currentTime = moment().tz('Asia/karachi');

    const order = await Orders.findByIdAndUpdate(
      orderId,
      { $set: req.body },
      { new: true }
    );

    if (status === 'Delivered') {
      const timeWhenDelivered = moment(currentTime, 'hh:mm').format('hh:mm a');
      order.timeWhenDelivered = timeWhenDelivered;
      await order.save();

      const query = {
        riderId: order.riderId,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
      };

      const [riderOrders, rider] = await Promise.all([
        Orders.countDocuments(query),
        Users.findById(order.riderId),
      ]);

      rider.pendingCollection += order.orderTotal;
      rider.save();

      if (riderOrders === 0) {
        await Users.findByIdAndUpdate(order.riderId, {
          status: 'idle',
        });
      }

      await Users.findByIdAndUpdate(order.riderId, {
        orderCount: rider.orderCount - 1,
      });

      const message = `Order# ${order.orderNum} has been delivered by ${order.riderName}`;
      orderStatusEmail(message);

      return res.json({
        status: '202',
        msg: 'Order successfully delivered',
      });
    }

    const pickUpTime = moment(currentTime, 'hh:mm').format('hh:mm a');
    order.pickUpTime = pickUpTime;
    await order.save();

    res.json({ status: '200', data: order });

    const user = await Users.findById(order.userId);

    const pickUpMsg =
      'Your order has been picked up by dastak rider and will be delivered to you shortly';

    /*  await axios.get(
      `${process.env.SMS_URL}&mobile=${order.phone}&message=${pickUpMsg}`
    ); */

    if (user.type === 'admin') {
      const { playerIds } = await Users.findById(order.userId);

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

module.exports = router;
