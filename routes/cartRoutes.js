// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart, updateQuantity, getCartLength } = require('../controllers/cartController');

router.post('/add', addToCart);
router.get('/get', getCart); // Pass userId as a query parameter
router.delete('/remove/:userId/:productId', removeFromCart);
router.put('/update-quantity', updateQuantity);
router.get('/cart-length', getCartLength);


module.exports = router;
