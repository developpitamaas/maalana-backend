const mongoose = require("mongoose");

// Define order schema
const SecondorderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  CartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shipedaddress",
  },
  billingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "billingaddress",
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: true,
    default: "Cash On Delievery",
    enum: ["Cash On Delievery", "Razorpay"],
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  paymentId: {
    type: String,
    default: null,
  },
  // UpdateAt: {
  //   type: Date,
  //   default: Date.now,
  // },
},{timestamps:true});

// Export order model
module.exports = mongoose.model("Secondorder", SecondorderSchema);
