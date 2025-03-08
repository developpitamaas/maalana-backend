const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/AddProducts");
const ActivityLog = require("../models/ActivityLog");
const Category = require("../models/Category");

// ✅ Get Dashboard Metrics
exports.getDashboardMetrics = async (req, res) => {
    try {
        const totalSales = await Order.countDocuments({ paymentMethod: "Razorpay" }); // Count successful orders
        const totalOrders = await Order.countDocuments(); // Count all orders
        const totalUsers = await User.countDocuments(); // Count registered users

        // ✅ Calculate Total Products (Sum of all product quantities)
        const totalProductsData = await Product.aggregate([
            { $count: "totalProducts" } // Count the number of products
        ]);

        const totalProducts = totalProductsData.length > 0 ? totalProductsData[0].totalProducts : 0;

        // ✅ Calculate Total Revenue
        const totalRevenueData = await Order.aggregate([
            { $match: { paymentMethod: "Razorpay" } }, // Only count successful payments
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } } // Sum totalAmount field
        ]);
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;

        res.status(200).json({
            success: true,
            data: {
                totalSales,
                totalOrders,
                totalUsers,
                totalProducts,
                totalRevenue
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

exports.getDashboardCharts = async (req, res) => {
    try {
        const { range } = req.query; // Get filter from query params
        let startDate, endDate;

        const currentDate = new Date();
        endDate = new Date(currentDate);

        if (range === "weekly") {
            startDate = new Date();
            startDate.setDate(currentDate.getDate() - 7);
        } else if (range === "monthly") {
            startDate = new Date();
            startDate.setMonth(currentDate.getMonth() - 1);
        } else if (range === "yearly") {
            startDate = new Date();
            startDate.setFullYear(currentDate.getFullYear() - 1);
        } else if (range === "prev_year") {
            startDate = new Date();
            startDate.setFullYear(currentDate.getFullYear() - 2);
            endDate.setFullYear(currentDate.getFullYear() - 1);
        } else {
            return res.status(400).json({ message: "Invalid range specified" });
        }

        // ✅ Fetch data based on date range
        const orders = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const users = await User.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, users: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const products = await Product.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, products: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // ✅ Format data to match frontend expectations
        const formattedData = orders.map((order, index) => ({
            date: order._id,
            orders: order.orders,
            users: users[index]?.users || 0,
            products: products[index]?.products || 0
        }));

        res.json({ data: formattedData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching chart data", error });
    }
};


// ✅ Get Recent Orders API
exports.getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 }) // Sort by latest
            .limit(10) // Get last 10 orders
            .select("orderId userId products totalAmount status createdAt"); // Select relevant fields

        // Format data
        const formattedOrders = recentOrders.map(order => ({
            id: order._id,
            orderId: order.orderId,
            customer: order.userId, // Change this if you populate user data
            date: order.createdAt,
            items: order.products,
            paymentMethod: order.paymentMethod || "Pending",
            status: order.orderStatus || "Processing"
        }));

        res.status(200).json({ orders: formattedOrders });
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// ✅ Add New Activity
exports.addActivity = async (req, res) => {
    try {
        const { event, user } = req.body;
        if (!event || !user) {
            return res.status(400).json({ message: "Event and user are required." });
        }

        const newActivity = new ActivityLog({ event, user });
        await newActivity.save();

        res.status(201).json({ message: "Activity logged successfully", newActivity });
    } catch (error) {
        console.error("Error adding activity:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// ✅ Get Recent Activities (Last 10)
exports.getRecentActivities = async (req, res) => {
    try {
        const activities = await ActivityLog.find().sort({ timestamp: -1 }).limit(10);
        res.status(200).json({ activities });
    } catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// ✅ Get Low Stock Products
exports.getLowStockProducts = async (req, res) => {
    try {
        // Find products where stock is below reorder level
        const lowStockProducts = await Product.find({ quantity: { $lt: 10 } }) // Threshold: 10
            .select("name quantity reorderLevel images")
            .sort({ quantity: 1 });

        if (lowStockProducts.length === 0) {
            return res.status(200).json({ message: "All products are in stock.", products: [] });
        }

        res.status(200).json({ products: lowStockProducts });
    } catch (error) {
        console.error("Error fetching low stock products:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// ✅ Get Categories with Low Stock
exports.getCategoriesWithLowStock = async (req, res) => {
    try {
        // Fetch all categories
        const categories = await Category.find().select("name");

        // Object to store categories with low stock
        let lowStockCategories = [];

        // Loop through each category and check if any product is low in stock
        for (const category of categories) {
            const lowStockProducts = await Product.find({
                category: category.name,
                quantity: { $lte: 10 }, // Stock ≤ 10
            }).select("name quantity");

            if (lowStockProducts.length > 0) {
                lowStockCategories.push({
                    category: category.name,
                    products: lowStockProducts,
                });
            }
        }

        if (lowStockCategories.length === 0) {
            return res.status(200).json({ message: "All categories are sufficiently stocked.", categories: [] });
        }

        res.status(200).json({ categories: lowStockCategories });
    } catch (error) {
        console.error("Error fetching categories with low stock:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
