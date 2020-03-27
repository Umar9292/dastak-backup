const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../../models/userModel');

router.post('/editProfile', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.body.userId,
            { $set: req.body },
            { new: true }
        ).select('-password -__v');

        return res.json({
            status: '200',
            data: user
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

router.post("/changePassword", async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.json({
        status: '404',
        msg: 'User not found'
    });

    const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (oldPasswordMatch === false) return res.json({
        status: '404',
        msg: 'Old password didnot match'
    });

    const newPasswordMatch = await bcrypt.compare(newPassword, user.password);
    if (newPasswordMatch === true) return res.json({
        status: '404',
        msg: 'You cant set the previous password again'
    });

    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashNewPassword;

    await user.save();

    return res.json({
        status: '200',
        msg: 'Your password is updated successfully'
    });
});

module.exports = router;