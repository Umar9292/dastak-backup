const express = require('express');
const router = express.Router();

const Marts = require('../../models/martsModel');

router.post('/addMart', async (req, res) => {
    try {
        const params = req.body;

        const query = {
            name: params.name,
            location: params.location
        };

        const mart = await Marts.findOne(query);
        if (mart) return res.json({
            status: '404',
            msg: 'This Mart is already registered'
        });

        await new Marts(req.body).save();

        return res.json({
            status: '200',
            msg: 'Mart registered'
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
            error: err.toString()
        });
    }
});

router.get("/allMarts", async (req, res) => {
    try {
        const query = {
            type: 'admin',
            status: 'active',
            shop:'mart'
        };

        const allMarts = await Marts.find(query)
            .sort({ name: 1 })
            .select('-password -__v');

        return res.json({
            status: '200',
            data: allMarts
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            data: 'Looks like an error occurred on our side. Kindly try again',
            error: err.toString()
        });
    }
});


router.get("/allRestaurants", async (req, res) => {
    try {
        const query = {
            type: 'admin',
            status: 'active',
            shop:'restaurant'
        };

        const allRestaurants = await Marts.find(query)
            .sort({ name: 1 })
            .select('-password -__v');

        return res.json({
            status: '200',
            data: allRestaurants
        });
    }
    catch (err) {
        return res.json({
            status: '404',
            data: 'Looks like an error occurred on our side. Kindly try again',
            error: err.toString()
        });
    }
});

module.exports = router;