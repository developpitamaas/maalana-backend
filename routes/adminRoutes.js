const express = require("express");
const router = express.Router();
const { loginAdmin, signupAdmin } = require("../controllers/adminController");

// Define admin login route
router.post("/login", loginAdmin);

// Define admin signup route
router.post("/signup", signupAdmin);

module.exports = router;
