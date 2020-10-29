const nodeMailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

exports.emailOrderDetails = (
  shop,
  user,
  orderTime,
  orderAddress,
  products,
  count,
  orderTotal
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
      defaultLayout: 'order.hbs',
    },
    viewPath: `${__dirname}/views/`,
    extName: '.hbs',
  };

  transporter.use('compile', hbs(handlebarOptions));

  const mailOptions = {
    from: 'no-reply@dastak.store',
    to: 'support@dastak.store',
    subject: 'Order Details',
    template: 'order',
    context: {
      customerName: user.name,
      customerAddress: orderAddress,
      customerPhone: user.phone,
      shopName: shop.name,
      shopPhone: shop.phone,
      shopAddress: shop.martAddress,
      orderTime,
      products,
      count,
      orderTotal,
    },
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
};

exports.notifyRestaurantByEmail = restaurantEmail => {
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
    to: restaurantEmail,
    subject: 'DASTAK',
    text: `YOU HAVE A NEW ORDER FROM DASTAK APP.`,
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.log(err);
    }
  });
};
