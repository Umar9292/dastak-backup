const { createTransport } = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

exports.emailOrderDetailsToCustomer = async (
  user,
  shop,
  date,
  orderTotal,
  customerAddress,
  products,
  count
) => {
  const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: false,
    pool: true,
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
      defaultLayout: 'customerEmail.hbs',
    },
    viewPath: `${__dirname}/views/`,
    extName: '.hbs',
  };

  transporter.use('compile', hbs(handlebarOptions));

  const mailOptions = {
    from: 'no-reply@dastak.store',
    to: user.email,
    subject: 'Order Details',
    template: 'customerEmail',
    context: {
      shopName: shop.name,
      orderDate: date,
      orderTotal,
      customerAddress,
      count,
      products,
    },
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
};
