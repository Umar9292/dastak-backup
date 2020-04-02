const express = require("express");
const router = express.Router();

const User = require('../../models/userModel');

router.post('/allotPlayerId', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.body.userId,
            { playerId: req.body.playerId },
            { new: true }
        ).select('-password -__v');

        return res.json({
            status: '200',
            data: updatedUser
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