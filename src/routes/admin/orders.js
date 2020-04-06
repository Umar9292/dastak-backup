const express = require('express');
const router = express.Router();

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');

const notify = require('../../notificationHandler/handler');

router.post('/saveOrder', async (req, res) => {
    try {
        req.body.products = JSON.parse(req.body.products);

        await new Orders(req.body).save();

        const admin = await Users.findById('5e79f1df7e7ffd367cb2a8b4').select('playerId');

        await notify.admin(admin.playerId, { flag: 'orderReceived' });

        return res.json({
            status: '200',
            msg: 'Order received'
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

router.get('/allOrders', async (req, res) => {
    try {
        const allOrders = await Orders.find().sort({ createdAt: -1 });

        if (allOrders.length === 0) {
            return res.json({
                status: '404',
                msg: 'There are no orders yet'
            });
        }

        return res.json({
            status: '200',
            data: allOrders
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
            const msg = `Dear ${user.name} your order# ${req.body.orderNum} has been shipped and will arrive in approximately 1 hour.`;

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