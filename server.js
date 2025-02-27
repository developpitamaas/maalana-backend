const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productsRoutes = require("./routes/addProductsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const billingRoutes = require("./routes/billingRoutes");
const otpRoutes = require("./routes/otpRoutes");
const couponRoutes = require("./routes/couponRoutes");
const baatCheetRoutes = require("./routes/baatCheetRoutes");
const humkoJoinKarloRoutes = require("./routes/humkoJoinKarloRoutes");
const shippingRoutes = require("./routes/shippingRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));

// Increase the request size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/category", categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/baat-cheet", baatCheetRoutes);
app.use("/api/humko-join-karlo", humkoJoinKarloRoutes);
app.use("/api/shipping", shippingRoutes);

const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
