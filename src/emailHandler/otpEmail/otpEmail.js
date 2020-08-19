const nodeMailer = require('nodemailer');

exports.emailOtp = (whomToSend, token) => {
  const transporter = nodeMailer.createTransport({
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
    to: whomToSend,
    subject: 'Verification Code',
    text: `Here is your verification code: ${token}`,
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
};
