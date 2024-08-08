const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    label: { type: String, required: true },
    imageURL: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('categories', categorySchema);
