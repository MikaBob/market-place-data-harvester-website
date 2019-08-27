const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }/*,
    salt: {
        type: String,
        required: true
    },
    session: {
        salt: String,
        expires: Date
    }*/
});

const User = mongoose.model("user", userSchema, "user");

module.exports = User;