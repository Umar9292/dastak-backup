const Router = require('express/lib/router');
const moment = require('moment-timezone');

const { unlinkSync } = require('fs');
const { IncomingForm } = require('formidable');
const { v2 } = require('cloudinary');

const Orders = require('../../models/ordersModel');
const Users = require('../../models/userModel');

const { notifyAdmin } = require('../../notificationHandler/handler');
const { getAddress } = require('../../geoCoder/getAddress');

const router = Router();

router.post('/uploadPrescription', (req, res) => {
  try {
    const form = new IncomingForm();

    form.uploadDir = 'uploads/prescriptions';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;

    form.parse(req, async (_err, fields, files) => {
      let orderData = JSON.parse(fields.orderData);

      const imgPath = files.prescription.path;

      const date = moment()
        .tz('Asia/Karachi')
        .format('DD-MM-YYYY');

      const time = moment()
        .tz('Asia/Karachi')
        .format('hh:mm a');

      const [
        { url: prescriptionImg },
        { playerIds, city },
        orderCount,
      ] = await Promise.all([
        v2.uploader.upload(imgPath, {
          quality: 'auto',
          folder: 'Prescriptions',
          width: 550,
          height: 550,
        }),

        Users.findById(orderData.martId)
          .select('playerIds city')
          .lean(),

        Orders.countDocuments({ martId: orderData.martId, date }),
      ]);

      if (orderData.address === 'Current Location') {
        const { latitude, longitude } = orderData;
        orderData.address = await getAddress(latitude, longitude);
      }

      orderData = {
        ...orderData,
        date,
        city,
        prescriptionImg,
        orderNum: orderCount + 1,
        time,
      };

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
