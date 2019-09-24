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
        required: true,
        select: false
    },
    register_date: {
        type: Date,
        default: Date.now
    },
    favorites: {
        type: Map,
        of: [String]
    }
});

module.exports = User = mongoose.model("user", userSchema, "user");