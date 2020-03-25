const express = require("express");
const router = express.Router();

const Orders = require("../../models/ordersModel");

router.post('/saveOrder', async (req, res) => {
    try {
        req.body.products = JSON.parse(req.body.products);

        await new Orders(req.body).save();

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
        const allOrders = await Orders.find();

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

router.post('/changeOrderStatus', async (req, res) => {
    try {
        await Orders.findByIdAndUpdate(req.body.orderId, { $set: req.body });

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

router.delete('/deleteOrder', async (req, res) => {
    try {
        await Orders.deleteOne({ _id: req.body.orderId });

        return res.json({
            status: '200',
            msg: 'Order deleted successfully'
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