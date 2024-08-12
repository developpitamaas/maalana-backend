const express = require('express');
const router = express.Router();
const productController = require('../controllers/adminProductAdd/index'); 

// Route to add a product
router.post('/admin/add-product', productController.addProduct);

// Route to get all products
router.get('/admin/get-all-products', productController.getAllProducts);

// Route to get a product by ID
router.get('/admin/get-product-by-id/:id', productController.getProductById);

// route to update product by ID
router.put('/admin/update-product/:id', productController.updateProduct);

// route to delete product by ID
router.delete('/admin/delete-product/:id', productController.deleteProduct);

// route to get category product
router.get('/get-category-product/:category', productController.getProductByCategory);

module.exports = router;
