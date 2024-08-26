const mongoose = require('mongoose');

// Define cart schema
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserId',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      shippingPrice: {
        type: Number,
        default: 0,
      },
      CoupanCode: {
        type: String,
      },
      coupanDiscount: {
        type: Number,
        default: 0,
      },
      CoupanValue: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      totalAmountAfterDiscount: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
      },
    },
  ],
});

// Export cart model
module.exports = mongoose.model('Cart', cartSchema);
