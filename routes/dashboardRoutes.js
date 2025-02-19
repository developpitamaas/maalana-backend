const express = require("express");
const router = express.Router();
const {
    getDashboardMetrics,
    getDashboardCharts,
    getRecentOrders,
    addActivity,
    getRecentActivities,
    getLowStockProducts,
    getCategoriesWithLowStock
} = require("../controllers/dashboardController");

// ✅ Route to get dashboard metrics
router.get("/metrics", getDashboardMetrics);

// ✅ Route to get dashboard charts
router.get("/charts", getDashboardCharts);

// ✅ Route to get recent orders
router.get("/orders/recent", getRecentOrders);

// ✅ Route to get recent activities
router.get("/activity/get", getRecentActivities);

// ✅ Route to add new activity log
router.post("/activity/add", addActivity);

// ✅ Route to get low stock products
router.get("/products/low-stock", getLowStockProducts);

// ✅ Route to get low stock products by category
router.get("/low-stock/categories", getCategoriesWithLowStock);


module.exports = router;
