const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    itemId:  mongoose.Schema.Types.ObjectId, // /!\ ce n'est pas le GID, mais l'ID de la DB
    userId:  mongoose.Schema.Types.ObjectId,
    timestamp: Date,
    price_1: Number,
    price_10: Number,
    price_100: Number,
    price_avg: Number
});

const Price = mongoose.model("price", priceSchema, "price");

module.exports = Price;