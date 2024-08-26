const mongoose = require('mongoose');
const bestSellersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    addedDate: {
        type: Date,
        default: Date.now
    }
});

const BestSellers = mongoose.model('BestSellers', bestSellersSchema);

module.exports = BestSellers