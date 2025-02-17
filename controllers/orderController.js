const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/AddProducts");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Create Order API
exports.createOrder = async (req, res) => {
    const { userId, paymentMethod } = req.body;

    if (!userId || !paymentMethod) {
        return res.status(400).json({ message: "User ID and payment method are required." });
    }

    try {
        // 🛒 Fetch user's cart
        const cartItems = await Cart.find({ userId }).populate({
            path: "productId",
            model: Product, // ✅ Use correct model reference
            select: "name price images"
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }

        // 🛍️ Prepare order details
        let totalAmount = 0;
        const orderProducts = cartItems.map(item => {
            const product = item.productId;
            const totalPrice = product.price * item.quantity;
            totalAmount += totalPrice;

            return {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.images[0] || ""
            };
        });

        let newOrder = new Order({
            userId,
            products: orderProducts,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid" // Razorpay needs confirmation
        });

        // 💰 If Razorpay, create a payment order
        if (paymentMethod === "Razorpay") {
            const shortReceipt = `ord_${userId.slice(-6)}_${Date.now().toString().slice(-6)}`;

            const razorpayOrder = await razorpay.orders.create({
                amount: totalAmount * 100, // Amount in paise
                currency: "INR",
                receipt: shortReceipt // ✅ Shortened to max 40 chars
            });


            newOrder.razorpayOrderId = razorpayOrder.id;
            newOrder.paymentStatus = "Pending";
        }

        // 🎯 Save order & remove from cart
        await newOrder.save();
        await Cart.deleteMany({ userId });

        res.status(201).json({
            message: "Order placed successfully.",
            order: newOrder
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// ✅ Verify Razorpay Payment and Update Order Status
exports.verifyPayment = async (req, res) => {
    const { razorpayOrderId, paymentId, signature, userId } = req.body;

    if (!razorpayOrderId || !paymentId || !signature || !userId) {
        return res.status(400).json({ message: "All payment details are required." });
    }

    try {
        const order = await Order.findOne({ razorpayOrderId, userId });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        order.paymentStatus = "Paid";
        await order.save();

        res.status(200).json({ message: "Payment successful!", order });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
