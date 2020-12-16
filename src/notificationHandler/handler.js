import { Notification } from 'onesignal-node';
import { oneSignalClient } from '../../utils/onSignalConfig';

export const notifyAdmin = async (info, msg, whomToSend, toBeSentData) => {
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

  const { data } = await oneSignalClient.sendNotification(notification);

  return data.id ? console.log(info) : console.log(data.errors[0]);
};

export const notifyUser = async (msg, whomToSend, toBeSentData) => {
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

  const { data } = await oneSignalClient.sendNotification(notification);

  return data.id ? console.log('User Notified') : console.log(data.errors[0]);
};

export const notifyRiders = async (msg, whomToSend, toBeSentData) => {
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

  const { data } = await oneSignalClient.sendNotification(notification);

  return data.id ? console.log('Rider Notified') : console.log(data.errors[0]);
};
