// routes/productRoutes.js
const express = require('express');
const { addProduct } = require('../controllers/maalanaAddProduct/index');
const upload = require('../config/cloudinary');

const router = express.Router();

router.post('/products/add', upload.array('images', 5), addProduct);

module.exports = router;
