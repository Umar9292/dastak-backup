const mongoose = require('mongoose');

const martsModel = mongoose.Schema(
    {
        status: String,
        img: String,
        logo: String,
        name: String,
        phone: String,
        password: String,
        address: String,
        openingTime: String,
        closingTime: String,
        playerId: String,
        type: {
            type: String,
            default: 'admin'
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

module.exports = mongoose.model('user', martsModel);