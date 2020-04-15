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

        const mart = await Mart.findById({ _id: params.martId })
            .select('-password -__v');

        const formatedOrderTime = moment(params.time).format('hh:mm');
        const orderTime = moment(formatedOrderTime, 'hh:mm').tz('Asia/karachi');
        const openingTime = moment(mart.openingTime, 'hh:mm').tz('Asia/karachi');
        const closingTime = moment(mart.closingTime, 'hh:mm').tz('Asia/karachi');

        if (orderTime.isBetween(openingTime, closingTime)) {

            params.products = await JSON.parse(params.products);
            params.martId = mart._id;
            params.martPhone = mart.phone;
            params.martAddress = mart.address;
            params.time = orderTime;

            await new Orders(params).save();

            await notify.admin(mart.playerId, { flag: 'orderReceived' });

            return res.json({
                status: '200',
                msg: 'Order received'
            });
        }

        return res.json({
            status: '404',
            msg: 'Mart is closed'
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            error: err.toString(),
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

router.get('/allOrders/:martId', async (req, res) => {
    try {
        const orders = await Orders.find({ martId: req.params.martId })
            .sort({ createdAt: -1 });

        if (orders.length === 0) {
            return res.json({
                status: '404',
                msg: 'There are no orders yet'
            });
        }

        return res.json({
            status: '200',
            data: orders
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            error: err.toString(),
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

router.post('/orderDetails', async (req, res) => {
    try {
        const order = await Orders.findById(req.body.orderId);

        return res.json({
            status: '200',
            data: order
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            error: err.toString(),
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

router.post('/specificUserOrders', async (req, res) => {
    try {
        const orders = await Orders.find({ userId: req.body.userId }).sort({ createdAt: 1 });

        return res.json({
            status: '200',
            data: orders
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            error: err.toString(),
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

router.post('/changeOrderStatus', async (req, res) => {
    try {
        const order = await Orders.findByIdAndUpdate(req.body.orderId, { $set: req.body });

        const user = await Users.findById(order.userId);

        if (req.body.status === 'Cancelled') {
            const msg = `Dear ${user.name} your order# ${req.body.orderNum} has been cancelled`;

            await notify.user(msg, user.playerId, { flag: 'orderCancelled' });
        }

        if (req.body.status === 'Shipped') {
            const msg = `Dear ${user.name} your order# ${req.body.orderNum} has been shipped and will arrive in approximately 2-3 hours.`;

            await notify.user(msg, user.playerId, { flag: 'orderShipped' });
        }

        return res.json({
            status: '200',
            msg: 'Order status updated'
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            error: err.toString(),
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience.`
        });
    }
});

module.exports = router;