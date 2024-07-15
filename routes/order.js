const express = require("express");
const data = require("../controllers/order/order");
const auth = require("../middleware/Auth");
const Order = express.Router();


// create order
Order.route("/get-all-orders").get(data.getAllOrders);
Order.route("/get-order-by-user-id/:id").get(data.getOrderByUserId);

// exports
module.exports = Order