const nodeMailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

exports.sendConfirmationEmail = async (
  whomToSend,
  firstName,
  lastName,
  receiptUrl
) => {
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

  const handlebarOptions = {
    viewEngine: {
      extName: '.hbs',
      partialsDir: `${__dirname}/views/`,
      layoutsDir: `${__dirname}/views/`,
      defaultLayout: 'appointmentReceipt.hbs',
    },
    viewPath: `${__dirname}/views/`,
    extName: '.hbs',
  };

  transporter.use('compile', hbs(handlebarOptions));

  const mailOptions = {
    from: 'no-reply@calldocmd.com',
    to: whomToSend,
    subject: 'Appointment Receipt',
    template: 'appointmentReceipt',
    context: {
      name: `${firstName} ${lastName}`,
      link: receiptUrl,
    },
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
};
