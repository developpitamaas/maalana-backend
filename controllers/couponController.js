const Coupon = require("../models/Coupon");
const Order = require("../models/Order");  // Ensure Order model is correctly imported

// ✅ Create a Coupon
exports.createCoupon = async (req, res) => {
    try {
        const { code, couponCategory, discountType, discountValue, minOrderAmount, maxDiscount, expirationDate, usageLimit } = req.body;

        // Check if coupon already exists
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) return res.status(400).json({ message: "Coupon code already exists." });

        // ✅ Ensure `couponCategory` is provided
        if (!couponCategory) {
            return res.status(400).json({ message: "Coupon category is required." });
        }

        const newCoupon = new Coupon({
            code,
            couponCategory, // ✅ Add the missing field
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscount,
            expirationDate,
            usageLimit
        });

        await newCoupon.save();
        res.status(201).json({ message: "Coupon created successfully.", coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ message: "Error creating coupon", error: error.message });
    }
};


// ✅ Get All Coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json({ coupons });
    } catch (error) {
        res.status(500).json({ message: "Error fetching coupons", error: error.message });
    }
};

// ✅ Get Single Coupon by Code
exports.getCouponByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) return res.status(404).json({ message: "Coupon not found." });

        res.status(200).json({ coupon });
    } catch (error) {
        res.status(500).json({ message: "Error fetching coupon", error: error.message });
    }
};

const checkUserOrderHistory = async (userId) => {
    const previousOrders = await Order.findOne({ userId });
    return previousOrders ? true : false;
};

exports.applyCoupon = async (req, res) => {
    try {
        const { code, orderAmount, userId, cartItems } = req.body; // Include userId for first_order check

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: "active" });

        if (!coupon) return res.status(400).json({ message: "Invalid or expired coupon." });

        if (new Date() > new Date(coupon.expirationDate)) {
            coupon.status = "expired";
            await coupon.save();
            return res.status(400).json({ message: "This coupon has expired." });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "Coupon usage limit reached." });
        }

        // ✅ Handle Different Coupon Types
        let discount = 0;

        if (coupon.couponCategory === "first_order") {
            // Check if user has any past orders (You need to implement checkUserOrderHistory function)
            const hasPreviousOrders = await checkUserOrderHistory(userId);
            if (hasPreviousOrders) {
                return res.status(400).json({ message: "This coupon is only valid for first-time customers." });
            }
            discount = coupon.discountType === "percentage"
                ? (orderAmount * coupon.discountValue) / 100
                : coupon.discountValue;
        }
        else if (coupon.couponCategory === "min_order") {
            if (orderAmount < coupon.minOrderAmount) {
                return res.status(400).json({ message: `Minimum order amount should be ₹${coupon.minOrderAmount}` });
            }
            discount = coupon.discountType === "percentage"
                ? (orderAmount * coupon.discountValue) / 100
                : coupon.discountValue;
        }
        else if (coupon.couponCategory === "bogo") {
            // Buy One Get One Free logic (Assuming cart contains eligible products)
            if (cartItems.length < 2) {
                return res.status(400).json({ message: "BOGO coupons require at least 2 items in the cart." });
            }
            const cheapestItem = cartItems.reduce((prev, curr) => prev.productUnitPrice < curr.productUnitPrice ? prev : curr);
            discount = cheapestItem.productUnitPrice; // Free item price as discount
        }
        else if (coupon.couponCategory === "favorite") {
            // Favorite Coupon (For returning customers, apply discount)
            discount = coupon.discountType === "percentage"
                ? (orderAmount * coupon.discountValue) / 100
                : coupon.discountValue;
        }
        else {
            // Standard Percentage or Fixed Discount
            discount = coupon.discountType === "percentage"
                ? (orderAmount * coupon.discountValue) / 100
                : coupon.discountValue;
        }

        // ✅ Apply Max Discount Cap if exists
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }

        coupon.usedCount += 1;
        await coupon.save();

        res.status(200).json({
            message: "Coupon applied successfully.",
            discount: discount.toFixed(2),
            finalAmount: (orderAmount - discount).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: "Error applying coupon", error: error.message });
    }
};


// ✅ Delete Coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        await Coupon.findOneAndDelete({ code: code.toUpperCase() });
        res.status(200).json({ message: "Coupon deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting coupon", error: error.message });
    }
};
