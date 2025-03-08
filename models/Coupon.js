// const mongoose = require("mongoose");

// const couponSchema = new mongoose.Schema({
//     code: { type: String, required: true, unique: true, uppercase: true },
//     couponCategory: {
//         type: String,
//         enum: ["percentage", "fixed", "first_order", "min_order", "bogo", "favorite"],
//         required: true
//     }, // ✅ New coupon types
//     discountType: { type: String, enum: ["percentage", "fixed"], required: true },
//     discountValue: { type: Number, required: true },
//     minOrderAmount: { type: Number, default: 0 },
//     maxDiscount: { type: Number, default: null },
//     expirationDate: { type: Date, required: true },
//     usageLimit: { type: Number, default: null },
//     usedCount: { type: Number, default: 0 },
//     status: { type: String, enum: ["active", "expired"], default: "active" },
// }, { timestamps: true });

// const Coupon = mongoose.model("Coupon", couponSchema);
// module.exports = Coupon;


const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    couponCategory: {
        type: String,
        enum: ["first_order", "min_order", "bogo", "festive", "specific_product", "specific_category"],
        required: true
    },
    discountType: { 
        type: String, 
        enum: ["percentage", "fixed"], 
        required: function() { return this.couponCategory !== "bogo"; } 
    },
    discountValue: { 
        type: Number, 
        required: function() { return this.couponCategory !== "bogo"; } 
    },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    expirationDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // ✅ Dynamic Usage Limit (null = unlimited)
    usedCount: { type: Number, default: 0 },
    applicableProducts: { type: [String], default: [] },
    applicableCategories: { type: [String], default: [] },
    bogoDiscount: { type: Number, default: null }, // For BOGO 50% off
    bogoMinPrice: { type: Number, default: null }, // Condition for BOGO
    status: { type: String, enum: ["active", "expired"], default: "active" }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
