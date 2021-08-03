const Router = require('express/lib/router');

const { unlinkSync } = require('fs');
const { IncomingForm } = require('formidable');
const { v2 } = require('cloudinary');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');

const { notifyAdmin } = require('../../notificationHandler/handler');

const router = Router();

router.post('/uploadPrescription', (req, res) => {
  try {
    const form = new IncomingForm();

    form.uploadDir = 'uploads/prescriptions';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;

    form.parse(req, async (_err, fields, files) => {
      const orderData = JSON.parse(fields.orderData);

      const imgPath = files.prescription.path;

      const [{ url }, { playerIds }] = await Promise.all([
        v2.uploader.upload(imgPath, {
          quality: 'auto',
          folder: 'Prescriptions',
          width: 550,
          height: 550,
        }),

        Users.findById(orderData.martId)
          .select('playerIds')
          .lean(),
      ]);

      orderData.prescriptionImg = url;
      await new Orders(orderData).save();

      const adminMessage = 'You have a new order';
      const info = `New Order for ${orderData.martName} placed by ${orderData.name}`;

      playerIds.forEach(async playerId => {
        await notifyAdmin(info, adminMessage, playerId, {
          flag: 'adminReceived',
        });
      });

      unlinkSync(imgPath);

      return res.json({
        status: '200',
        msg: 'Order has been placed successfully',
      });
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: '404',
      error: err.toString(),
      msg:
        'Looks like something went wrong on our side. Sorry for the incinvenience',
    });
  }
});

module.exports = router;
