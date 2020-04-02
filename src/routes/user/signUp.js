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
        if (user) return res.json({
            status: '404',
            msg: `The email you have entered is already associated with another account`
        });

        params.password = await bcrypt.hash(password, 10);

        const newUser = await new User(params).save();

        return res.json({
            status: '200',
            data: (_.pick(newUser, [
                '_id', 'email', 'phone', 'name', 'image', 'address', 'type'
            ]))
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

router.post('/signIn', async (req, res) => {
    try {
        let { email, password } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) return res.json({
            status: '404',
            msg: `The email you have entered is not associated with any account`
        });

        const result = await bcrypt.compare(password, user.password);
        if (!result) return res.json({
            status: '404',
            msg: `Email or password is invalid`
        });

        return res.json({
            status: '200',
            data: (_.pick(user, [
                '_id', 'email', 'phone', 'name', 'image', 'address', 'type', 'playerId'
            ]))
        });
    }
    catch (err) {
        res.json({
            status: '404',
            msg: `Looks like something went wrong on our side. Sorry for the inconvenience`,
            error: err.toString()
        });
    }
});

module.exports = router;