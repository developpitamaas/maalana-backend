const mongoose = require("mongoose");

// Define order schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  myOrder: {
    productName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    price: {
      type: Number,
      required: true,
    },
  },
});

// Export order model
module.exports = mongoose.model("Order", orderSchema);
