const express = require("express");
const User = express.Router();
const Data = require("../controllers/User/userController");
const auth = require("../middleware/Auth");

// register
User.route("/register-user").post(Data.RegisterUser)

// login
User.route("/login-user").post(Data.LoginUser)

// my profile
User.route("/my-profile").get(auth.IsAuthenticateUser, Data.myProfile)

// update
User.route("/update-user").put(auth.IsAuthenticateUser, Data.updateUser)

//update user by id
User.route("/update-user-by-id/:id").put(Data.updateProfileById)

// delete user
User.route("/delete-user/:id").delete(auth.IsAuthenticateUser, Data.deleteUser)

// get all users
User.route("/get-all-users").get(auth.IsAuthenticateUser,auth.authorizeRole("admin"), Data.getAllUsers)

// get single user
User.route("/get-single-user/:id").get(Data.getSingleUser) 

// forget password
User.route("/forgot-password").post(Data.ForgotPassword)
// reset password with OTP
User.route("/reset-password-with-otp").post(Data.resetPasswordWithOTP)

// check otp
User.route("/check-otp").post(Data.checkOTP)

// new forgot password
User.route("/new-forgot-password").post(Data.newForgotPassword)

// otp verify
User.route("/otp-verify").post(Data.verifyOtp)




// admin
// send mail to all user
User.route("/send-mail-to-all-users").post(auth.IsAuthenticateUser,auth.authorizeRole("admin"),Data.sendEmailToAllUsers)

module.exports = User