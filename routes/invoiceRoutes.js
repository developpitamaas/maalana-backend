const express = require("express");
const { generateInvoice, generateInvoicePDF } = require("../controllers/invoiceController");

const router = express.Router();

// ✅ Generate Invoice
router.post("/generate/:_id", generateInvoice);

// ✅ Generate PDF Invoice
router.get("/pdf/:_id", generateInvoicePDF);

module.exports = router;
