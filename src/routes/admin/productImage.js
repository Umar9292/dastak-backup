const express = require("express");
const router = express.Router();
const cloudinary = require('cloudinary');
const formidable = require('formidable');

router.post("/addImage", (req, res) => {
    try {
        let form = new formidable.IncomingForm();

        form.uploadDir = 'uploads/productImages';
        form.keepExtensions = true;
        form.maxFieldsSize = 10 * 1024 * 1024;

        form.parse(req, async (_err, _fields, files) => {
            const imgPath = files.avatar.path;

            const img = await cloudinary.v2.uploader.upload(imgPath,
                {
                    quality: 'auto',
                    folder: 'Product Images',
                    width: 600,
                    height: 600
                });

            return res.json({
                status: '200',
                data: img.url
            });
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: '400',
            error: err.toString(),
            msg: 'Looks like something went wrong on our side. Sorry for the incinvenience'
        });
    }
});

module.exports = router;