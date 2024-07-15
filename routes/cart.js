const Data = require("../controllers/order/cart");
const express = require("express");
const Cart = express.Router();

// add to cart
Cart.route("/add-to-cart").post(Data.addToCart);

// get cart
Cart.route("/get-cart/:id").get(Data.getCart);

// get all cart product
Cart.route("/get-all-cart").get(Data.getAllCart);



// exports
module.exports = Cart;
