const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  weight: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  addedDate: { type: Date, default: Date.now },
  description: { type: String, required: true },
  ingredients: { type: String },
  nutritionalInfo: { type: String },
  images: [{ type: String }],
  unitsSold: { type: Number, default: 0 }, // Field to track the number of units sold
});

const BestSellerProduct = mongoose.model('bestSellerProduct', productSchema);

module.exports = BestSellerProduct;
