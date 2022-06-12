const { Notification } = require('onesignal-node');
const {
  oneSignalUserClient,
  oneSignalVendorClient,
  oneSignalRiderClient,
  oneSignalAdminClient,
} = require('../../utils/onSignalConfig');

exports.notifyAdmin = async (info, msg, whomToSend, toBeSentData) => {
  const notification = new Notification({
    contents: {
      en: msg,
    },
    include_player_ids: [whomToSend],
    data: toBeSentData,
    ios_sound: 'dastak.wav',
    android_sound: 'dastak',
    android_channel_id: '0d6eaed6-91e1-42d1-9722-9622d9d40592',
    small_icon: 'ic_stat_onesignal_default',
    large_icon:
      'https://res.cloudinary.com/hmwday8rj/image/upload/v1596543000/ios_icon_rrtypi.png',
  });

  await oneSignalVendorClient.sendNotification(notification);
};

exports.notifySuperAdmin = async (info, msg, whomToSend, toBeSentData) => {
  const notification = new Notification({
    contents: {
      en: msg,
    },
    include_player_ids: [whomToSend],
    data: toBeSentData,
    ios_sound: 'dastak.wav',
    android_sound: 'dastak',
    android_channel_id: '9ad27650-17cc-43b3-9a07-7864b1860aa4',
    small_icon: 'ic_stat_onesignal_default',
    large_icon:
      'https://res.cloudinary.com/hmwday8rj/image/upload/v1596543000/ios_icon_rrtypi.png',
  });

  await oneSignalAdminClient.sendNotification(notification);
};

exports.notifyUser = async (msg, whomToSend, toBeSentData) => {
  const notification = new Notification({
    contents: {
      en: msg,
    },
    include_player_ids: [whomToSend],
    data: toBeSentData,
    ios_sound: 'dastak.wav',
    android_sound: 'dastak',
    android_channel_id: '89c63241-377d-49b6-8605-271517dc0a71',
    small_icon: 'ic_stat_onesignal_default',
    large_icon:
      'https://res.cloudinary.com/hmwday8rj/image/upload/v1596543000/ios_icon_rrtypi.png',
  });

  await oneSignalUserClient.sendNotification(notification);
};

exports.notifyRiders = async (riderName, msg, whomToSend, toBeSentData) => {
  const notification = new Notification({
    contents: {
      en: msg,
    },
    include_player_ids: [whomToSend],
    data: toBeSentData,
    ios_sound: 'dastak.wav',
    android_sound: 'dastak',
    android_channel_id: '978916b0-393b-4003-a090-405ccab2d321',
    small_icon: 'ic_stat_onesignal_default',
    large_icon:
      'https://res.cloudinary.com/hmwday8rj/image/upload/v1596543000/ios_icon_rrtypi.png',
  });

  await oneSignalRiderClient.sendNotification(notification);
};
