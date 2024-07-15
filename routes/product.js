const express = require("express");
const Product = express.Router();
const Data = require("../controllers/Product/product");
const auth = require("../middleware/Auth");

// create product
Product.route("/create-product").post(Data.CreateProduct)

// exports
module.exports = Product