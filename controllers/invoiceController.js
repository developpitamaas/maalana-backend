const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const BillingAddress = require("../models/BillingAddress");
const ShippingAddress = require("../models/ShippingAddress");
const Product = require("../models/AddProducts");

const COMPANY_STATE = "Punjab"; // ✅ Your business location

// ✅ Generate Invoice API
exports.generateInvoice = async (req, res) => {
    const { _id } = req.params;  // ✅ Use `_id` instead of `orderId`

    if (!_id) {
        return res.status(400).json({ message: "Order ID is required." });
    }

    try {
        const order = await Order.findById(_id).populate({
            path: "products.productId",
            model: Product
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // ✅ Check if invoice already exists
        let existingInvoice = await Invoice.findOne({ orderId: _id });
        if (existingInvoice) {
            return res.status(400).json({ message: "Invoice already exists for this order.", invoice: existingInvoice });
        }

        // ✅ Determine if order is within the same state for SGST+CGST or IGST
        const isSameState = order.shippingAddress.state === COMPANY_STATE;

        // ✅ Calculate Tax
        const subtotal = order.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let cgst = 0, sgst = 0, igst = 0, taxAmount = 0;

        if (isSameState) {
            cgst = subtotal * 0.09;
            sgst = subtotal * 0.09;
        } else {
            igst = subtotal * 0.18;
        }

        taxAmount = cgst + sgst + igst;
        const totalAmount = subtotal + taxAmount;

        // ✅ Check if user has a separate Billing Address or use Shipping Address
        let billingAddress = await BillingAddress.findOne({ userId: order.userId });

        if (!billingAddress) {
            billingAddress = order.shippingAddress;
        }
        // console.log('order.userDetails.firstName', order.userDetails);

        // ✅ Create Invoice
        const invoiceData = new Invoice({
            orderId: order._id,
            OrderId: order.orderId,
            invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
            userDetails: {
                fullName: order.userDetails.fullName,  // ✅ Now includes full name
                email: order.userDetails.email,
                phone: order.userDetails.phone,
                profileImage: order.userDetails.image
            },
            shippingAddress: order.shippingAddress,
            billingAddress: billingAddress,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentMethod === "Razorpay" ? "Paid" : "Pending",
            products: order.products,
            subtotal,
            cgst,
            sgst,
            igst,
            totalTax: taxAmount,
            totalAmount,
            razorpayOrderId: order.razorpayOrderId
        });

        await invoiceData.save();

        res.status(201).json({ message: "Invoice generated successfully.", invoice: invoiceData });
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// ✅ Generate PDF Invoice
exports.generateInvoicePDF = async (req, res) => {
    const { _id } = req.params;  // ✅ Use `_id` instead of `orderId`

    try {
        const invoice = await Invoice.findOne({ orderId: _id }).populate({
            path: "products.productId",
            model: Product
        });

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        // ✅ Ensure shipping & billing addresses exist
        const shippingAddress = invoice.shippingAddress || {};
        const billingAddress = invoice.billingAddress || {}; // FIX: Ensure billingAddress exists

        // ✅ Create PDF
        const doc = new PDFDocument({ size: "A4" });
        const filePath = path.join(__dirname, "../invoices", `Invoice_${invoice.invoiceNumber}.pdf`);
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);
        doc.fontSize(18).text("MAALANA FOODS PRIVATE LIMITED", { align: "center" });
        doc.fontSize(12).text("Maalana Foods, Punjab, India 141001", { align: "center" });
        doc.text("Contact: +91 97645-12486 | Email: maalanafoods@gmail.com | GSTIN: 07AAXCS0655F1ZV", { align: "center" });
        doc.moveDown();

        doc.fontSize(14).text(`TAX INVOICE`, { align: "center", underline: true });
        doc.moveDown();
        doc.text(`Invoice No: ${invoice.invoiceNumber}`);
        doc.text(`Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`);
        doc.text(`Order No: ${invoice.OrderId}`);
        doc.text(`Payment Status: ${invoice.paymentStatus}`);
        doc.moveDown();

        // ✅ Shipping Address
        doc.fontSize(12).text(`Shipping Address:`);

        if (shippingAddress.street) {
            doc.text(`${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.pincode}, ${shippingAddress.country}`);
        } else {
            doc.text("Not provided.");
        }
        doc.moveDown();

        // ✅ Billing Address
        doc.text(`Billing Address:`);

        if (billingAddress.street) {
            doc.text(`${billingAddress.street}, ${billingAddress.city}, ${billingAddress.state}, ${billingAddress.pincode}, ${billingAddress.country}`);
        } else {
            doc.text("Not provided.");
        }
        doc.moveDown();

        // ✅ User Details
        const userDetails = invoice.userDetails || {}; // Ensure userDetails exist
        doc.text(`Customer: ${userDetails.fullName || "N/A"}`);
        doc.text(`Email: ${userDetails.email || "N/A"}`);
        doc.text(`Phone: ${userDetails.phone || "N/A"}`);
        doc.moveDown();

        // ✅ Ensure proper font before writing text
        doc.font("Helvetica").fontSize(12);

        // ✅ Order Items Table with Proper Formatting
        invoice.products.forEach((item, index) => {
            let cleanName = item.name.replace(/[^\x20-\x7E]/g, ""); // Removes hidden characters
            let formattedPrice = Number(item.price).toFixed(2); // Ensures price is a valid number

            doc.text(`${index + 1}. ${cleanName} -  ${formattedPrice} x ${item.quantity}`);
        });

        doc.moveDown();

        // ✅ Explicitly format and sanitize numbers to remove unwanted characters
        doc.font("Helvetica-Bold").fontSize(12);

        doc.text(`Subtotal:  ${Number(invoice.subtotal).toFixed(2)}`);
        doc.text(`CGST:  ${Number(invoice.cgst).toFixed(2)}`);
        doc.text(`SGST:  ${Number(invoice.sgst).toFixed(2)}`);
        doc.text(`IGST:  ${Number(invoice.igst).toFixed(2)}`);
        doc.text(`Total Tax:  ${Number(invoice.totalTax).toFixed(2)}`);
        doc.text(`Grand Total:  ${Number(invoice.totalAmount).toFixed(2)}`, { bold: true });

        doc.end();
        writeStream.on("finish", () => {
            res.download(filePath, `Invoice_${invoice.invoiceNumber}.pdf`);
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};