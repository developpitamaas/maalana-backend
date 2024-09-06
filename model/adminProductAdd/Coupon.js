// models/Coupon.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');  // For generating unique coupons

const couponSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  discount: {
    type: Number, 
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
