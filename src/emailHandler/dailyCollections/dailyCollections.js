import { createTransport } from 'nodemailer';
import { unlinkSync } from 'fs';

export const sendDailyCollection = async name => {
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
    to: 'support@dastak.store',
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
