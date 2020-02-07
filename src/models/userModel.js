const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    isVerified: {
        type: Boolean,
        default: false
    },
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    password: String,
    address: String,
    image: String
});

module.exports = mongoose.model('users', userModel);