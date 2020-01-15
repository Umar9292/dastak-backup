const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const _ = require('lodash');

const User = require('../../models/userModel');

router.post('/signUp', async (req, res) => {
    try {
        const params = req.body;
        let { email, password } = params;
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(200).json({
                msg: `The email you have entered is alrady associated with another account`
            });
        } else {
            params.password = await bcrypt.hash(password, 10);
            const newUser = new User(params);
            await newUser.save();
            res.status(200).json('User Saved Successfully');
        }
    } catch (err) {
        res.status(500).json({
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
            error: err.toString()
        });
    }
});

router.post('/signIn', async (req, res) => {
    try {
        let { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(500).json({
                msg: `The email you have entered is not associated with any account`
            });
        } else {
            const result = await bcrypt.compare(password, user.password);
            if (!result) {
                return res.status(500).json({
                    msg: `Email or password is invalid`
                });
            } else {
                return res.status(200).json(_.pick(user, ['_id', 'email', 'phone']));
            }
        }
    } catch (err) {
        res.status(500).json({
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
            error: err.toString()
        });
    }
});

module.exports = router;