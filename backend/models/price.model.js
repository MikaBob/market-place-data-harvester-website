const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    itemGID: {
        type: Number,
        required: true,
    },
    userId: mongoose.Schema.Types.ObjectId,
    timestamp: Date,
    price_1: Number,
    price_10: Number,
    price_100: Number,
    price_avg: Number
});

module.exports = Price = mongoose.model("price", priceSchema, "price");