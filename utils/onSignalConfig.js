const { Client } = require('onesignal-node');

exports.oneSignalClient = new Client({
  userAuthKey: process.env.ONE_SIGNAL_USER_AUTH_KEY,

  app: {
    appAuthKey: process.env.ONE_SIGNAL_APP_AUTH_KEY,
    appId: process.env.ONE_SIGNAL_APP_ID,
  },
});
