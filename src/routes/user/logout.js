const express = require('express');
const router = express.Router();

const User = require('../../models/userModel');

router.post('/logout', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.body.userId, { playerId: '' });

        return res.json({ status: '200' });
    }
    catch (err) {
        return res.json({
            status: '404',
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
            error: err.toString()
        });
    }
});

module.exports = router;