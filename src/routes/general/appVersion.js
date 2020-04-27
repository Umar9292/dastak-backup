const express = require('express');
const router = express.Router();

router.post('/checkVersion', async (req, res) => {
    try {
        const body = req.body;
        console.log(body);

        if (body.platform === 'ios' && body.version === '1.1.10') return res.json({ status: '200' });

        if (body.platform === 'ios' && body.version !== '1.1.10') {
            return res.json({
                status: '404',
                msg: `We have updated the App.So kindly update your App from the App Store to get the best experience`
            });
        }

        if (body.platform === 'android' && body.version === '1.1.11') return res.json({ status: '200' });

        if (body.platform === 'android' && body.version !== '1.1.11') {
            return res.json({
                status: '404',
                msg: `We have updated the App.So kindly update your App from the App Store to get the best experience`
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