const Data = require("../controllers/order/cart");
const express = require("express");
const Cart = express.Router();

// add to cart
Cart.route("/add-to-cart").post(Data.addToCart);

// get cart
Cart.route("/get-cart/:id").get(Data.getCart);

// get all cart product
Cart.route("/get-all-cart").get(Data.getAllCart);

// update the product quantity in cart by user id and product id
Cart.route("/update-cart").put(Data.updateCart);

// get all cart product by user id
Cart.route("/get-all-cart-by-user/:id").get(Data.getAllCartByUser);



// exports
module.exports = Cart;
