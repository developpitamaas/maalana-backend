const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    OrderId: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, unique: true, required: true },
    invoiceDate: { type: Date, default: Date.now },
    userDetails: {
        fullName: String,
        email: String,
        phone: String,
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
    },
    paymentMethod: { type: String, enum: ["COD", "Razorpay"], required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            name: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],
    subtotal: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalTax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    razorpayOrderId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
