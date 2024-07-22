const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  quantity: {
    type: String,
  },
  weight: {
    type: String,
  },
  price: {
    type: Number,
  },
  category: {
    type: String,
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
  },
  ingredients: {
    type: [String], 
  },
  nutritionalInfo: {
    energy: {
      type: String, 
    },
    totalFat: {
      type: String, 
    },
    protein: {
      type: String, 
    },
    carbohydrates: {
      type: String, 
    },
    sugar: {
      type: String,
    }
  },
  images: {
    mainImage: {
      type: String, 
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
