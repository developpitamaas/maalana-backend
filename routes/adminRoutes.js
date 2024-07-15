const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminLogin/login');

// Login route
router.post('/admin/login', adminController.login);

module.exports = router;
