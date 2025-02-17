const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../controllers/orderController");

// 📌 Order Routes
router.post("/create-orders", createOrder); // Place order (COD / Razorpay)
router.post("/verify-payment", verifyPayment); // Verify Razorpay Payment

module.exports = router;
