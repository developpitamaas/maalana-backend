const express = require("express");
const { signup, login, googleLogin, getUserDetails, updateUserDetails } = require("../controllers/authController");

const router = express.Router();

router.post("/register-user", signup);
router.post("/login-user", login);
router.post("/google-login", googleLogin);
router.get("/user-details/:userId", getUserDetails);
router.put("/update-user-details/:userId", updateUserDetails);


module.exports = router;
