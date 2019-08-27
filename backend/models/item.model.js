const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemGID: {
        type: Number,
        required: true,
        unique: true,
        trim: true,
    },
    lvl: Number,
    label: { type: String, trim: true },
    type: { type: String, trim: true },
    category: { type: String, trim: true },
});

const Item = mongoose.model("item", itemSchema, "item");

module.exports = Item;