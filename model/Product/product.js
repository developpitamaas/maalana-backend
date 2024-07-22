const mongoose = require('mongoose');

// Define product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: String,
  },
  category: {
    type: String,
  },
  brand: {
    type: String,
  },
  weight: [
    {
      type: String,
    },
  ],
  images: {
    coverImage: {
      type: String,
      default: "https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png"
    },
    frontImage: {
      type: String,
      default: "https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png"
    },
    backImage: {
      type: String,
      default: "https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png"
    },
    leftSideImage: {
      type: String,
      default: "https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png"
    },
    rightSideImage: {
      type: String,
      default: "https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png"
    },
  },
  ingredients: {
    type: String,
  },
  nutritionalInformation: {
    type: String,
  },
});

// Export product model
module.exports = mongoose.model("Product", productSchema);
