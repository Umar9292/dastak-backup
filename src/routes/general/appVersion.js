const express = require('express');
const router = express.Router();

router.post('/checkVersion', async (req, res) => {
    try {
        const body = req.body;

        if (body.platform === 'ios' && body.version === '1.2.1') return res.json({ status: '200' });

        if (body.platform === 'ios' && body.version !== '1.2.1') {
            return res.json({
                status: '404',
                msg: `A new update is now available. kindly update your App to get the best experience`
            });
        }

        if (body.platform === 'android' && body.version === '1.2.0') return res.json({ status: '200' });

        if (body.platform === 'android' && body.version !== '1.2.0') {
            return res.json({
                status: '404',
                msg: `A new update is now available. kindly update your App to get the best experience`
            });
        }
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