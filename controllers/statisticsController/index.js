const Statistics = require("../../model/statistics");
const Users = require("../../model/User/users");
const Product = require("../../model/Product/product");
const order = require("../../model/order/order");

exports.getStatistics = async (req, res) => {
    const userCount = await Users.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await order.countDocuments();
    const statistics = await Statistics.findOne();
    const inStock = await Product.countDocuments({ quantity: { $gt: 0 } });
    const outOfStock = await Product.countDocuments({ quantity: { $lte: 0 } });
     
     // Count orders by delivery status
     const deliveredCount = await order.countDocuments({ deliveryStatus: "Delivered" });
     const shippedCount = await order.countDocuments({ deliveryStatus: "Shipped" });
     const pendingCount = await order.countDocuments({ deliveryStatus: "Pending" });

    res.status(200).json({
        success: true,
        userCount,
        productCount,
        orderCount,
        inStock,
        outOfStock,
        statistics,
        deliveredCount,
        shippedCount,
        pendingCount
    });
};