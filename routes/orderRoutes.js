const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, getAllOrders, getOrderById } = require("../controllers/orderController");

// 📌 Order Routes
router.post("/create-orders", createOrder); // Place order (COD / Razorpay)
router.post("/verify-payment", verifyPayment); // Verify Razorpay Payment
router.get("/get-all-orders", getAllOrders); // Get all orders
router.get("/get-order-by-id/:orderId", getOrderById); // Get order by ID

module.exports = router;
