const { createTransport } = require('nodemailer');

exports.sendAcceptanceEmail = async (email, msg) => {
  const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: false,
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
    to: email,
    subject: 'Order Status',
    text: msg,
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
};
