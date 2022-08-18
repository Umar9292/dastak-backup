const { createTransport } = require('nodemailer');
const { unlinkSync } = require('fs');

exports.sendCollection = async name => {
  const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER_NAME,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: 'no-reply@dastak.store',
    to: 'umar@dastakdelivery.com',
    subject: 'Daily Rider Collections',
    attachments: [
      {
        path: `${process.cwd()}/${name}`,
      },
    ],
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }

    unlinkSync(`${process.cwd()}/${name}`);
  });
};
