const express = require("express");
const router = express.Router();
const { saveBillingAddress, getBillingAddress } = require("../controllers/billingController");

// 📌 Save or Update Billing Address
router.post("/save", saveBillingAddress);

// 📌 Get Billing Address by User ID
router.get("/:userId", getBillingAddress);

module.exports = router;
