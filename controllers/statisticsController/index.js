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
    res.status(200).json({
        success: true,
        userCount,
        productCount,
        orderCount,
        inStock,
        outOfStock,
        statistics
    });
};