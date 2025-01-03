// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    flavour: { type: String },
    itemForm: { type: String },
    ingredients: { type: String },
    calories: { type: Number },
    protein: { type: Number },
    carbohydrates: { type: Number },
    fat: { type: Number },
    fiber: { type: Number },
    sugar: { type: Number },
    sodium: { type: Number },
    cholesterol: { type: Number },
    category: { type: String },
    foodCategory: { type: String },
    brand: { type: String },
    description: { type: String },
    aboutItems: { type: [String] },
    images: { type: [String] }, // Cloudinary image URLs
});

module.exports = mongoose.model('maalanaProduct', productSchema);
