const { Client } = require('onesignal-node');

exports.oneSignalUserClient = new Client({
  userAuthKey: process.env.ONE_SIGNAL_USER_AUTH_KEY,

  app: {
    appAuthKey: process.env.ONE_SIGNAL_APP_AUTH_KEY,
    appId: process.env.ONE_SIGNAL_USER_APP_ID,
  },
});

exports.oneSignalVendorClient = new Client({
  userAuthKey: process.env.ONE_SIGNAL_USER_AUTH_KEY,

  app: {
    appAuthKey: process.env.ONE_SIGNAL_APP_AUTH_KEY,
    appId: process.env.ONE_SIGNAL_VENDOR_APP_ID,
  },
});

exports.oneSignalAdminClient = new Client({
  userAuthKey: process.env.ONE_SIGNAL_USER_AUTH_KEY,

  app: {
    appAuthKey: process.env.ONE_SIGNAL_APP_AUTH_KEY,
    appId: process.env.ONE_SIGNAL_ADMIN_APP_ID,
  },
});

exports.oneSignalRiderClient = new Client({
  userAuthKey: process.env.ONE_SIGNAL_USER_AUTH_KEY,

  app: {
    appAuthKey: process.env.ONE_SIGNAL_APP_AUTH_KEY,
    appId: process.env.ONE_SIGNAL_RIDER_APP_ID,
  },
});
