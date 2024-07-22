const mongoose = require('mongoose');

const StatisticsSchema = new mongoose.Schema({
  totalProducts: { type: Number, required: true },
  inStock: { type: Number, required: true },
  outOfStock: { type: Number, required: true },
  totalUsers: { type: Number, required: true },
  totalOrders: { type: Number, required: true }
});

module.exports = mongoose.model('Statistics', StatisticsSchema);
