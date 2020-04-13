const mongoose = require('mongoose');

const martsModel = mongoose.Schema({
    img: String,
    name: String,
    phone: String,
    password: String,
    address: String,
    openingTime: String,
    closingTime: String,
    playerId: String
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('marts', martsModel);