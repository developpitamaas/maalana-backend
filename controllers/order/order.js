const Order = require("../../model/order/order");
const TryCatch = require("../../middleware/Trycatch");
const User = require("../../model/User/users");
// const Coupan = require("../../model/coupan/coupan");
const Coupon = require("../../model/coupan/coupan");
const Product = require("../../model/Product/product");
// const shippingAddress = require("../../model/order/shipedaddress");
const BillingAddress = require("../../model/order/billingaddress");
const ApiFeatures = require("../../utils/apifeature");


const getAllOrders = TryCatch(async (req, res, next) => {
  const order = await Order.find();
  res.status(200).json({
    success: true,
    order,
    message: "Order fetched successfully",
  });
})

const getOrderByUserId = TryCatch(async (req, res, next) => {
  const order = await Order.find({ userId: req.params.id });
  res.status(200).json({
    success: true,
    order,
    message: "Order fetched successfully",
  });
  res.status(404).json({
    success: false,
    message: "Order not found",
  });
})

// exports
module.exports = {
  getAllOrders,
  getOrderByUserId,
};
