const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController/index');

// Create a new order
router.post('/orders', orderController.createOrder);

module.exports = router;
