const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    itemGID: Number,
    userId: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true,
    },
    isValid: Boolean,
    date_bought: Date,
    date_sold: Date,
    price_bought: Number,
    price_sold: Number
});

module.exports = Purchase = mongoose.model("purchase", purchaseSchema, "purchase");