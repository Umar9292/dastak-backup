const Router = require('express/lib/router');
const axios = require('axios');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');
const { getPreciseDistance } = require('geolib');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');
const WalletHistory = require('../../models/walletHistory');

const { getAddress } = require('../../geoCoder/getAddress');
const {
  calculateRiderFare,
} = require('../../calculateRiderFare/calculateRiderFare');
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
  notifySuperAdmin,
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
      paymentType,
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

    const orderTime = moment().tz('Asia/karachi');
    const formatedTime = moment(orderTime, 'hh:mm').format('hh:mm a');

    if (params.address === 'Current Location') {
      params.address = await getAddress(latitude, longitude);
    }

    params = {
      ...params,
      discount: orderType === 'PickUp' ? '0' : req.body.discount,
      paymentType: orderType === 'PickUp' ? 'COD' : req.body.paymentType,
      paymentMethod: orderType === 'PickUp' ? 'COD' : req.body.paymentMethod,
      products: await JSON.parse(products),
      city: mart.city,
      martId: mart._id,
      martName: mart.name,
      martPhone: mart.phone,
      martAddress: mart.martAddress,
      time: formatedTime,
      deliveryCharges:
        employee || orderType === 'pickUp' ? '0' : deliveryCharges,
      date,
      orderNum: todaysOrders + 1,
      orderTotal:
        employee && orderType !== 'PickUp'
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
      notifyAdmin(info, adminMessage, playerId, {
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

    const [user, admins] = await Promise.all([
      Users.findById(userId).select('-password -__v'),

      Users.find({
        adminType: { $in: ['admin', 'super admin'] },
        status: 'active',
      })
        .select('superAdminPlayerId')
        .lean(),
    ]);

    admins.forEach(admin => {
      notifySuperAdmin(info, adminMessage, admin.superAdminPlayerId, {
        flag: 'adminReceived',
      });
    });

    if (paymentType === 'wallet') {
      user.wallet.amount -= orderTotal;
      user.save();

      const history = {
        type: 'Deduction',
        amount: orderTotal,
        userId,
        orderId: order._id,
        time: moment()
          .tz('Asia/karachi')
          .format('DD-MM-YYYY hh:mm a'),
      };

      new WalletHistory(history).save();
    }

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

router.post('/deliveredOrders', async (req, res) => {
  try {
    let { martId, filter, startDate, endDate } = req.body;

    startDate = moment(startDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();
    endDate = moment(endDate, 'DD-MM-YYYY')
      .tz('Asia/Karachi')
      .toISOString();

    let deliveredOrdersQuery;
    if (filter) {
      deliveredOrdersQuery = {
        $or: [
          { status: 'Delivered', paid: false },
          { status: 'Rejected', refundToRestaurant: true, paid: false },
        ],
        martId,
        dateForSearching: { $gte: startDate, $lte: endDate },
      };
    } else {
      deliveredOrdersQuery = {
        $or: [
          { status: 'Delivered', paid: false },
          { status: 'Rejected', refundToRestaurant: true, paid: false },
        ],
        martId,
      };
    }

    const [{ percentage }, deliveredOrders] = await Promise.all([
      Users.findById(martId)
        .select('percentage')
        .lean(),

      Orders.find(deliveredOrdersQuery)
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
      deliveredOrders.map(async ({ products, orderType }) => {
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
      deliveredOrders,
      dealPayment: dealPaymentForRestaurant,
      nonDealPayment,
      totalToPay,
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

router.post('/ongoingOrders', async (req, res) => {
  try {
    const { martId } = req.body;

    const [upcoming, accepted] = await Promise.all([
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
    ]);

    return res.json({
      status: '200',
      upcoming,
      accepted,
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

router.post('/cancelOrder', async (req, res) => {
  try {
    const { orderId, reason, refundToCustomer, refundToRestaurant } = req.body;

    const {
      status,
      paymentMethod,
      orderType,
      orderTotal,
      discount,
    } = await Orders.findById(orderId)
      .select('status paymentMethod orderType orderTotal discount')
      .lean();

    if (status === 'Rejected') {
      return res.json({ status: '404', msg: 'Already Rejected' });
    }

    const order = await Orders.findByIdAndUpdate(orderId, {
      status: 'Rejected',
      refundToCustomer,
      refundToRestaurant,
      reason,
    });

    const [user, shop] = await Promise.all([
      Users.findById(order.userId),

      Users.findById(order.martId)
        .select('name shopType playerIds')
        .lean(),
    ]);

    const otpPhone = 92 + user.phone.substring(1, 11);

    if (
      paymentMethod === 'COD' ||
      orderType === 'PickUp' ||
      !refundToCustomer
    ) {
      let msg = '';

      if (!refundToCustomer) {
        msg = `Dear Dastak user, ${shop.name} could not process your order at the moment due to some reason. We are sorry for the inconvenience.`;
      } else {
        msg = `Dear Dastak user, ${shop.name} could not process your order at the moment due to some reason. Don't worry the voucher amount will be refunded to your Dastak wallet and you can use that amount right away to place another order.`;
      }

      axios.get(
        `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
          msg
        )}`
      );

      notifyUser(msg, user.playerId, {
        flag: !refundToCustomer ? 'orderCancelled' : 'refund',
      });

      if (paymentMethod === 'COD' && refundToCustomer) {
        const refund = {
          type: 'Refund',
          transactionId: order._id,
          amount: discount,
          userId: user._id,
          orderId,
          time: moment()
            .tz('Asia/karachi')
            .format('MM-DD-YYYY hh:mm a'),
        };

        await Promise.all([
          Users.findByIdAndUpdate(order.userId, {
            'wallet.amount': user.wallet.amount + +discount,
          }),

          new WalletHistory(refund).save(),
        ]);
      }
    } else {
      const msg = `Dear Dastak user, ${shop.name} could not process your order at the moment due to some reason. Don't worry the amount will be refunded to your Dastak wallet and you can use that amount right away to place another order.`;

      axios.get(
        `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
          msg
        )}`
      );

      notifyUser(msg, user.playerId, { flag: 'refund' });

      const refund = {
        type: 'Refund',
        transactionId: order.transactionId,
        amount: orderTotal + +discount,
        userId: user._id,
        orderId,
        time: moment()
          .tz('Asia/karachi')
          .format('MM-DD-YYYY hh:mm a'),
      };

      await Promise.all([
        Users.findByIdAndUpdate(order.userId, {
          'wallet.amount': user.wallet.amount + orderTotal + +discount,
        }),

        new WalletHistory(refund).save(),
      ]);
    }

    if (order.riderId) {
      const ongoingOrders = await Orders.countDocuments({
        riderId: order.riderId,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
      });

      if (ongoingOrders === 0) {
        await Users.findByIdAndUpdate(order.riderId, { status: 'idle' });
      }

      await Users.findByIdAndUpdate(order.riderId, {
        $inc: { orderCount: -1 },
      });
    }

    return res.json({
      status: '200',
      msg: 'Order cancelled',
    });
  } catch (err) {
    console.error(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`,
    });
  }
});

router.post('/restaurantResponse', async (req, res) => {
  try {
    const {
      orderId,
      status,
      customerNotified,
      orderLatitude,
      orderLongitude,
      martId,
    } = req.body;

    const {
      status: orderStatus,
      paymentMethod,
      orderType,
      orderNum,
      discount,
      city,
    } = await Orders.findById(orderId)
      .select('status paymentMethod orderNum orderType discount city')
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

    const { geometry } = await Users.findById(martId)
      .select('geometry')
      .lean();

    const [longitude, latitude] = geometry.coordinates;

    req.body.riderFare = await calculateRiderFare(
      city,
      +orderLatitude,
      +orderLongitude,
      latitude,
      longitude
    );

    if (status === 'Rejected') {
      req.body.refundToRestaurant = false;
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
      Users.findById(order.userId)
        .select('playerId phone wallet')
        .lean(),

      Users.findById(order.martId)
        .select('name')
        .lean(),
    ]);

    const otpPhone = 92 + user.phone.substring(1, 11);

    if (status === 'Rejected') {
      if (paymentMethod === 'COD' || orderType === 'PickUp') {
        let msg = '';

        if (+discount === 0) {
          msg = `Dear Dastak user, ${shop.name} could not process your order at the moment due to some reason. We are sorry for the inconvenience.`;
        } else {
          msg = `Dear Dastak user, ${shop.name} could not process your order at the moment due to some reason. Don't worry the voucher amount will be refunded to your Dastak wallet and you can use that amount right away to place another order.`;
        }
        axios.get(
          `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
            msg
          )}`
        );

        notifyUser(msg, user.playerId, {
          flag: +discount === 0 ? 'orderCancelled' : 'refund',
        });

        if (paymentMethod === 'COD' && +discount > 0) {
          const refund = {
            type: 'Refund',
            transactionId: order._id,
            amount: discount,
            userId: user._id,
            orderId,
            time: moment()
              .tz('Asia/karachi')
              .format('MM-DD-YYYY hh:mm a'),
          };

          await Promise.all([
            Users.findByIdAndUpdate(order.userId, {
              'wallet.amount': user.wallet.amount + +discount,
            }),

            new WalletHistory(refund).save(),
          ]);
        }
      } else {
        const msg = `Dear Dastak user, ${shop.name} could not process your order at the moment due to some reason. Don't worry the amount will be refunded to your Dastak wallet and you can use that amount right away to place another order.`;

        axios.get(
          `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
            msg
          )}`
        );

        notifyUser(msg, user.playerId, { flag: 'refund' });

        const refund = {
          type: 'Refund',
          transactionId: order.transactionId,
          amount: order.orderTotal + +discount,
          userId: user._id,
          orderId,
          time: moment()
            .tz('Asia/karachi')
            .format('MM-DD-YYYY hh:mm a'),
        };

        await Promise.all([
          Users.findByIdAndUpdate(order.userId, {
            'wallet.amount': user.wallet.amount + order.orderTotal + +discount,
          }),

          new WalletHistory(refund).save(),
        ]);
      }

      return res.json({
        status: '200',
        msg: 'Order cancelled',
      });
    }

    if (status === 'Admin Accepted' && !customerNotified) {
      if (orderType === 'PickUp') {
        const msg = `Dear Dastak user your order# ${order.orderNum} from ${shop.name} is accepted and being prepared. We'll notify you once it's ready.`;

        notifyUser(msg, user.playerId, { flag: 'preparingOrder' });

        axios.get(
          `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
            msg
          )}`
        );

        return res.json({
          status: '200',
          msg: 'Order successfully accepted',
        });
      }

      const msg = `Dear Dastak user your order# ${orderNum} from ${shop.name} is accepted and being prepared. We'll notify you once it's dispatched.`;
      notifyUser(msg, user.playerId, { flag: 'preparingOrder' });

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

      const ridersMessage = `New order from ${shop.name}`;

      if (idleRiders.length === 0) {
        allRiders.forEach(async rider => {
          const { name, playerId } = rider;

          notifyRiders(name, ridersMessage, playerId, {
            flag: 'riderNotified',
          });
        });
      } else {
        idleRiders.forEach(async rider => {
          const { name, playerId } = rider;

          notifyRiders(name, ridersMessage, playerId, {
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

      axios.get(
        `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
          msg
        )}`
      );

      const adminMessage = `The order number ${orderNum} has been Accepted by ${shop.name}`;
      orderStatusEmail(adminMessage);
    }

    if (status === 'Admin Accepted' && customerNotified) {
      const msg = `Dear ${user.name} your order# ${orderNum} for ${shop.name} is now ready. Kindly pick it up`;
      notifyUser(msg, user.playerId, { flag: 'preparingOrder' });

      axios.get(
        `${process.env.OTP_URL}&to=${otpPhone}&message=${encodeURIComponent(
          msg
        )}`
      );

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

/* router.post('/adminAcceptedOrders', async (req, res) => {
  try {
    const { riderId } = req.body;

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

    let acceptedOrders = [];

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
          city,
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
        city,
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
}); */

/* router.post('/adminAcceptedOrders', async (req, res) => {
  try {
    const { riderId } = req.body;

    const { name, available, city } = await Users.findById(riderId)
      .select('name available city')
      .lean();

    console.log(`${name} refreshed`);

    let acceptedOrders = [];

    if (available) {
      acceptedOrders = await Orders.find({
        status: 'Admin Accepted',
        orderType: 'Delivery',
        city,
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
 */

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
          'pendingCollection name paymentLimit orderCount fareType tillNoonFare'
        )
        .lean(),

      Orders.find({
        collectionSubmitted: false,
        paymentType: 'COD',
        status: 'Delivered',
        date: currentDate,
        riderId,
      })
        .select('orderTotal time')
        .lean(),
    ]);

    const { pendingCollection, name, paymentLimit, orderCount } = rider;

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
        paymentType: 'COD',
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
      req.body.assignedBy = name;
    } else {
      req.body.assignedBy = 'admin';
    }

    if (rider.fareType && rider.fareType === 'salary') {
      req.body.riderFare = rider.tillNoonFare;
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

    const { playerIds } = await Users.findById(order.martId);

    const message = `Dastak rider ${riderName} is assigned to order# ${order.orderNum}.`;
    const info = `${riderName} is assigned to an order for ${order.martName} placed by ${order.name}`;

    playerIds.forEach(async playerId => {
      notifyAdmin(info, message, playerId, {
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

router.post('/riderOngoingOrders', async (req, res) => {
  try {
    const { riderId, city } = req.body;

    let [
      upcoming,
      accepted,
      // idleRiders,
      { available },
    ] = await Promise.all([
      Orders.find({
        status: 'Admin Accepted',
        orderType: 'Delivery',
        city,
      })
        .sort({
          createdAt: -1,
        })
        .lean(),

      Orders.find({
        riderId,
        status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
        orderType: 'Delivery',
        city,
      })
        .sort({
          createdAt: -1,
        })
        .lean(),

      /*  Users.countDocuments({
        type: 'rider',
        status: 'idle',
        available: true,
        city,
      }), */

      Users.findById(riderId)
        .select('available')
        .lean(),
    ]);

    /* if (idleRiders > 0) {
      if (status === 'idle' && available) {
        upcoming = await Orders.find({
          status: 'Admin Accepted',
          orderType: 'Delivery',
          city,
        })
          .sort({
            createdAt: -1,
          })
          .lean();
      }
    } else if (available) {
      upcoming = await Orders.find({
        status: 'Admin Accepted',
        orderType: 'Delivery',
        city,
      })
        .sort({
          createdAt: -1,
        })
        .lean();
    } */

    if (!available) {
      upcoming = [];
    }

    accepted = await Promise.all(
      accepted.map(async order => {
        const { martId } = order;

        const { geometry } = await Users.findById(martId)
          .select('geometry')
          .lean();

        const [longitude, latitude] = geometry.coordinates;
        order.martLatitude = latitude.toString();
        order.martLongitude = longitude.toString();
        return order;
      })
    );

    return res.json({
      status: '200',
      upcoming,
      accepted,
    });
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

    const { fareType, pendingCollection } = await Users.findById(
      riderId
    ).lean();

    let deliveredOrders;

    if (fareType === 'salary') {
      deliveredOrders = await Orders.find({
        riderId,
        paidToRider: false,
        status: 'Delivered',
      }).sort({
        createdAt: -1,
      });
    } else {
      deliveredOrders = await Orders.find({
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

    const totalRidersFare = deliveredOrders.reduce(
      (a, b) => a + b.riderFare,
      0
    );
    const totalOrdersAmount = pendingCollection;
    deliveredOrders = deliveredOrders.filter(order => order.reason === '');

    return res.json({
      status: '200',
      deliveredOrders,
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
    const { orderId, status, martId, riderLatitude, riderLongitude } = req.body;

    const currentTime = moment().tz('Asia/karachi');

    const { status: currentOrderStatus } = await Orders.findById(orderId);
    if (currentOrderStatus === 'Delivered') {
      return res.json({
        status: '404',
        msg: 'Order is already delivered',
      });
    }

    if (status === 'Rider Picked Up') {
      const { latitude, longitude } = await Users.findById(martId)
        .select('latitude longitude')
        .lean();

      const distance =
        getPreciseDistance(
          { latitude: riderLatitude, longitude: riderLongitude },
          { latitude: +latitude, longitude: +longitude }
        ) / 1000;

      if (distance > 0.1) {
        return res.json({
          status: '404',
          msg: 'Kindly go near the restaurant.',
        });
      }
    }

    const order = await Orders.findByIdAndUpdate(
      orderId,
      { $set: req.body },
      { new: true }
    );

    if (status === 'Delivered') {
      const timeWhenDelivered = moment(currentTime, 'hh:mm').format('hh:mm a');
      order.timeWhenDelivered = timeWhenDelivered;
      await order.save();

      if (order.orderType === 'Delivery') {
        const query = {
          riderId: order.riderId,
          status: { $in: ['Rider Accepted', 'Rider Picked Up'] },
        };

        const [riderOrders, rider] = await Promise.all([
          Orders.countDocuments(query),
          Users.findById(order.riderId),
        ]);

        if (order.paymentType === 'COD') {
          rider.pendingCollection += order.orderTotal;
          await rider.save();
        }

        if (riderOrders === 0) {
          await Users.findByIdAndUpdate(order.riderId, {
            status: 'idle',
          });
        }

        await Users.findByIdAndUpdate(order.riderId, {
          orderCount: rider.orderCount - 1,
        });
      }

      const message = `Order# ${order.orderNum} has been delivered by ${order.riderName}`;
      orderStatusEmail(message);

      return res.json({
        status: '202',
        msg: 'Order successfully delivered',
      });
    }

    const pickUpTime = moment(currentTime, 'hh:mm').format('hh:mm a');
    order.pickUpTime = pickUpTime;
    order.save();

    res.json({
      status: '200',
      data: order,
      msg: 'Order picked up successfully.',
    });

    const user = await Users.findById(order.userId);

    const pickUpMsg =
      'Your order has been picked up by dastak rider and will be delivered to you shortly';

    /*  await axios.get(
      `${process.env.SMS_URL}&mobile=${order.phone}&message=${pickUpMsg}`
    ); */

    if (user.type === 'admin') {
      const { playerIds } = await Users.findById(order.userId);

      playerIds.forEach(async playerId => {
        notifyUser(pickUpMsg, playerId, { flag: 'orderPickedUp' });
      });
    } else {
      const { playerId } = await Users.findById(order.userId);

      notifyUser(pickUpMsg, playerId, { flag: 'orderPickedUp' });
    }

    const message = `Order# ${order.orderNum} has been picked up by ${order.riderName}`;
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

module.exports = router;
