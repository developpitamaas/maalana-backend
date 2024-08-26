const express = require('express');
const router = express.Router();

const BestSellerProduct = require('../controllers/BestSellerProduct/index');

// Route to get best seller products
router.get('/best-sellers', BestSellerProduct.getBestSellers);

// Route to add a product
router.post('/best-seller-product', BestSellerProduct.addProduct);

module.exports = router;
