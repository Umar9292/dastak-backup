const express = require("express");
const router = express.Router();

const Orders = require("../../models/ordersModel");

router.post('/saveOrder', async (req, res) => {
    try {
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

module.exports = router;