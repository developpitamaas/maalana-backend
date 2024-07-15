const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true
  },
  weight: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  ingredients: {
    type: [String], 
    required: true
  },
  nutritionalInfo: {
    energy: {
      type: String, 
      required: true
    },
    totalFat: {
      type: String, 
      required: true
    },
    protein: {
      type: String, 
      required: true
    },
    carbohydrates: {
      type: String, 
      required: true
    },
    sugar: {
      type: String,
      required: true
    }
  },
  images: {
    mainImage: {
      type: String, 
      required: true
    },
    frontImage: {
      type: String 
    },
    backImage: {
      type: String
    },
    leftImage: {
      type: String 
    },
    rightImage: {
      type: String
    }
  }
});

module.exports = mongoose.model('products', productSchema);
