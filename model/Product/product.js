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
  image: [
    {
      type: String,
      default: "https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png"
    },
  ],
});

// Export product model
module.exports = mongoose.model("Product", productSchema);
