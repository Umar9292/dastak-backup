const { createTransport } = require('nodemailer');

exports.emailOrderDetailsToRider = async riderEmails => {
  const msg = 'You have got a new order';

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
    to: riderEmails,
    subject: 'Order Status',
    text: msg,
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
};
