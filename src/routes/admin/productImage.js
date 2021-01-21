const Router = require('express/lib/router');

const { unlinkSync } = require('fs');
const { IncomingForm } = require('formidable');
const { v2 } = require('cloudinary');

const router = Router();

router.post('/addImage', (req, res) => {
  try {
    const form = new IncomingForm();

    form.uploadDir = 'uploads/productImages';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;

    form.parse(req, async (_err, _fields, files) => {
      const imgPath = files.avatar.path;

      const img = await v2.uploader.upload(imgPath, {
        quality: 'auto',
        folder: 'Product Images',
        width: 550,
        height: 550,
      });

      res.json({
        status: '200',
        data: img.url,
      });

      unlinkSync(imgPath);
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '400',
      error: err.toString(),
      msg:
        'Looks like something went wrong on our side. Sorry for the incinvenience',
    });
  }
});

module.exports = router;
