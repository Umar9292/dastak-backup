const { Notification } = require('onesignal-node');
const { oneSignalClient } = require('../../utils/onSignalConfig');

exports.admin = async (whomToSend, toBeSentData) => {
    const msg = `You have a new order`;

    const notification = new Notification({
        contents: {
            en: msg
        },
        include_player_ids: [whomToSend],
        data: toBeSentData,
        small_icon: 'ic_stat_onesignal_default',
        large_icon: 'https://img.onesignal.com/t/edc94b24-7af3-4755-8333-585d40096361.png'
    });

    const res = await oneSignalClient.sendNotification(notification);
    console.log(res.data);
};

exports.user = async (msg, whomToSend, toBeSentData) => {
    const notification = new Notification({
        contents: {
            en: msg
        },
        include_player_ids: [whomToSend],
        data: toBeSentData,
        small_icon: 'ic_stat_onesignal_default',
        large_icon: 'https://img.onesignal.com/t/edc94b24-7af3-4755-8333-585d40096361.png'
    });

    const res = await oneSignalClient.sendNotification(notification);
    console.log(res.data);

};