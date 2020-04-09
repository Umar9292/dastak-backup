const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    name: String,
    phone: String,
    password: String,
    address: String,
    image: String,
    playerId: String,
    type: {
        type: String,
        default: 'user'
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('users', userModel);