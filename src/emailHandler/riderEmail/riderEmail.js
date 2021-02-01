const { createTransport } = require('nodemailer');

exports.emailOrderDetailsToRider = async riderEmail => {
  const msg = 'You have got a new order';

  const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    pool: true,
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
    to: riderEmail,
    subject: 'Order Status',
    text: msg,
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
};
