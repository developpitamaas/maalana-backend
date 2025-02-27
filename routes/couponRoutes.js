const express = require("express");
const {
    createCoupon,
    getAllCoupons,
    getCouponByCode,
    applyCoupon,
    deleteCoupon
} = require("../controllers/couponController");

const router = express.Router();

// Routes for Coupon Management
router.post("/create", createCoupon);  // Create a coupon
router.get("/", getAllCoupons);        // Get all coupons
router.get("/:code", getCouponByCode); // Get a coupon by code
router.post("/apply", applyCoupon);    // Apply a coupon at checkout
router.delete("/:code", deleteCoupon); // Delete a coupon

module.exports = router;
