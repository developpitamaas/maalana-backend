const express = require("express");
const router = express.Router();
const { addProducts, getAllProducts, getSingleProduct, deleteProduct, editProduct } = require("../controllers/addProductsController");

// Define admin login route
router.post("/add-products", addProducts);

//  Get all products route
router.get("/get-all-products", getAllProducts);

// Get a single product route
router.get("/get-single-product/:id", getSingleProduct);

// Delete a product route
router.delete("/delete-product/:id", deleteProduct);

// Edit a product route
router.put("/edit-product/:id", editProduct);

module.exports = router;