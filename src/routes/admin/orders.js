const Router = require('express/lib/router');
const moment = require('moment-timezone');
const axios = require('axios');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');
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
    const {
      orderTotal,
      martId,
      userId,
      products,
      latitude,
      longitude,
    } = params;

    const date = moment()
      .tz('Asia/Karachi')
      .format('DD-MM-YYYY');

    const [mart, customer, todaysOrders] = await Promise.all([
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
      const result = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${process.env.GOOGLE_API_KEY}`
      );

      params.address = result.data.results[0].formatted_address;
    }

    params = {
      ...params,
      products: await JSON.parse(products),
      martId: mart._id,
      martName: mart.name,
      martPhone: mart.phone,
      martAddress: mart.martAddress,
      time: formatedTime,
      orderTotal: customer.employee ? orderTotal - 30 : orderTotal,
      deliveryCharges: customer.employee ? '0' : params.deliveryCharges,
      date,
      orderNum: todaysOrders + 1,
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

    const [
      { percentage },
      upcoming,
      accepted,
      delivered,
      unpaidOrders,
    ] = await Promise.all([
      Users.findById(martId)
        .select('name percentage')
        .lean(),

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
        paid: false,
        status: 'Delivered',
      })
        .sort({
          createdAt: -1,
        })
        .lean(),

      Orders.find({
        martId,
        paid: false,
        status: 'Delivered',
      })
        .select('orderTotal deliveryCharges orderType')
        .lean(),
    ]);

    const deliveryOrders = unpaidOrders.filter(
      ({ orderType }) => orderType === 'Delivery'
    );

    const totalAmount = deliveryOrders.reduce((a, b) => a + b.orderTotal, 0);

    const amountWithoutDelivery = unpaidOrders.reduce(
      (a, b) =>
        b.deliveryCharges !== '0' ? a + b.orderTotal - 30 : a + b.orderTotal,
      0
    );

    const deliveryCharges = unpaidOrders.reduce(
      (a, b) => (b.deliveryCharges !== '0' ? a + 30 : a),
      0
    );

    const ourPercentage = +(
      (percentage / 100) *
      amountWithoutDelivery
    ).toFixed();

    const totalToPay = totalAmount - (deliveryCharges + ourPercentage);

    return res.json({
      status: '200',
      upcoming,
      accepted,
      delivered,
      amountWithoutDelivery,
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

      Users.findById(order.martId)
        .select('name shopType playerIds')
        .lean(),
    ]);

    const ridersMessage = `New order from ${shop.name}`;

    if (status === 'Rejected') {
      const msg = `Dear ${user.name} your order# ${orderNum} could not be accepted by ${shop.shopType} because ${reason}`;

      /* await axios.get(
        `${process.env.SMS_URL}&mobile=${user.phone}&message=${msg}`
      ); */

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

        const rider = await Users.findById(order.riderId).select('orderCount');
        rider.orderCount -= 1;
        await rider.save();
      }
    }

    if (status === 'Admin Accepted' && !customerNotified) {
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

        /* await axios.get(
          `${process.env.SMS_URL}&mobile=${user.phone}&message=${msg}`
        ); */

        return res.json({
          status: '200',
          msg: 'Order successfully accepted',
        });
      }

      const msg = `Dear ${user.name} your order# ${orderNum} is accepted and being prepared. We'll notify you once it's dispatched.`;
      await notifyUser(msg, user.playerId, { flag: 'preparingOrder' });

      if (user.email !== '') {
        sendAcceptanceEmail(user.email, msg);
      }

      const [idleRiders, allRiders] = await Promise.all([
        Users.find({
          type: 'rider',
          status: 'idle',
          available: true,
        })
          .select('name email playerId')
          .lean(),

        Users.find({
          type: 'rider',
          available: true,
        })
          .select('name email playerId')
          .lean(),
      ]);

      let riderEmails = [];

      if (idleRiders.length === 0) {
        await Promise.all(
          allRiders.map(async rider => {
            const { name, email, playerId } = rider;

            await notifyRiders(name, ridersMessage, playerId, {
              flag: 'riderNotified',
            });

            if (email !== '') {
              riderEmails = [...riderEmails, email];
            }
          })
        );

        emailOrderDetailsToRider(riderEmails);
      }

      await Promise.all(
        idleRiders.map(async rider => {
          const { name, email, playerId } = rider;

          await notifyRiders(name, ridersMessage, playerId, {
            flag: 'riderNotified',
          });

          if (email !== '') {
            riderEmails = [...riderEmails, email];
          }
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

      if (user.email !== '') {
        sendAcceptanceEmail(user.email, msg);
      }

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
      Users.find({ type: 'rider', status: 'idle', available: true })
        .select('status name')
        .lean(),

      Users.findById(riderId).lean(),
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

/* router.post('/assignRider', async (req, res) => {
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

    const depositTimeUpperLimit = moment('04:00', 'HH:mm').tz('Asia/Karachi');
    const depositTimeLowerLimit = moment('22:00', 'HH:mm').tz('Asia/Karachi');

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
      currentDateOrders,
    ] = await Promise.all([
      Orders.findById(orderId),

      Users.findById(riderId)
        .select(
          'tillNoonFare nightFare pendingCollection name paymentLimit orderCount'
        )
        .lean(),

      Orders.find({ riderId, currentDate, status: 'Delivered' })
        .select('orderTotal time')
        .lean(),
    ]);

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

    if (!admin && orderCount >= 2) {
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
      })
        .select('orderTotal time')
        .lean();

      const previousDatefilteredOrders = previousDateOrders.filter(order => {
        const orderTime = moment(order.time, 'HH:mm a')
          .tz('Asia/Karachi')
          .subtract(5, 'hours');

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

router.post('/assignRider', async (req, res) => {
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
});

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

        const { latitude, longitude } = await Users.findById(martId)
          .select('latitude longitude')
          .lean();

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
