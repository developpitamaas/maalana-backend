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

// route to add best seller product
router.post('/admin/add-best-seller-product', productController.addBestSellerProduct);

// route to get best seller product
router.get('/admin/get-best-seller-product', productController.getBestSellerProduct);

// route to get orders
router.get('/get-orders', productController.getOrders);

// route to create order
router.post('/create-orders', productController.createOrder);

// route to get all orders
// router.get('/get-all-orders', productController.getAllOrders);

// send order details email
router.post('/send-order-details-email', productController.sendEmail);

// update the order status
router.put('/update-order-status/:id', productController.updateOrderStatus);

// coupon
router.post('/generate-coupon', productController.generateCoupon);

// apply coupon
router.post('/apply-coupon', productController.applyCoupon);

//payment verification
router.post('/payment-verification', productController.verifyRazorpayPayment);

// route to create order online payment
router.post('/create-order-online', productController.createOrderOnline);

// route to get orders by user id
router.get('/get-orders-by-user-id/:userId', productController.getOrderByUserId);

// route to get order details by order number
router.get('/get-order-details-by-order-number/:orderNumber', productController.getOrderDetailsByOrderNumber);

// exports
module.exports = router;
