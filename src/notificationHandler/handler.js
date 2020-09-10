const { Notification } = require('onesignal-node');
const { oneSignalClient } = require('../../utils/onSignalConfig');

exports.admin = async (msg, whomToSend, toBeSentData) => {
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

  const res = await oneSignalClient.sendNotification(notification);
  console.log(res.data);
};

exports.user = async (msg, whomToSend, toBeSentData) => {
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

  const res = await oneSignalClient.sendNotification(notification);
  console.log(res.data);
};

exports.riders = async (msg, whomToSend, toBeSentData) => {
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

  const res = await oneSignalClient.sendNotification(notification);
  console.log(res.data);
};
