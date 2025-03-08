const mongoose = require("mongoose");
const BillingAddress = require("./BillingAddress");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],
    orderId: { type: String, unique: true, required: true, default: () => `${Math.floor(100000 + Math.random() * 900000)}` },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD", "Razorpay"], required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    orderStatus: { type: String, enum: ["Processing", "Shipped", "Delivered", "Cancelled"], default: "Processing" },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
    },
    BillingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
    },
    userDetails: {
        fullName: String,
        email: String,
        phone: String,
        image: String
    },
    shiprocketOrderId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
