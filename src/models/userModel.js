const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    password: String,
    address: String,
    image: String
});

module.exports = mongoose.model('users', userModel);