const Trycatch = require("../../middleware/Trycatch");
const User = require("../../model/User/users");
const sendToken = require("../../utils/userToken");
const Mail = require("../../utils/sendmail");
const NodeCache = require("node-cache");
const cache = new NodeCache();
// Register User
const RegisterUser = Trycatch(async (req, res, next) => {
  // check email
  const useremail = await User.findOne({ email: req.body.email });
  if (useremail) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  // check mobile number
  const mobileNumberCheck = await User.findOne({
    mobileNumber: req.body.mobileNumber,
  });
  if (mobileNumberCheck) {
    return res.status(400).json({
      success: false,
      message: "Mobile number already exists",
    });
  }

  const user = await User.create(req.body);

  // remove cache
  cache.del("users");
  cache.del("totalUsers");
  //   send mail
  Mail(
    user.email,
    "Registered Successfully",
    "You have been registered successfully. Please login to your account. Thank you!"
  ),
    res.status(200).json({
      success: true,
      user: user,
      message: "Registered Successfully",
      token: user.token,
      expiresIn: 3600,
    });
});

// Login User
const LoginUser = Trycatch(async (req, res, next) => {
  const { email, password } = req.body;
  //   if there is no email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  //   check if user exists
  const user = await User.findOne({ email }).select("+password");

  //   if user does not exist
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  //   if user exists
  const isMatch = await user.comparePassword(password);
  // if password does not match
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
  // if all is good then send token
  sendToken(user, 200, res);
});

// my profile
const myProfile = Trycatch(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,

  });
});

const updateProfileById = Trycatch(async (req, res, next) => {
  const { id } = req.params; // Assuming the user ID is passed as a route parameter

  // Check if req.body is not empty
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "No data provided to update",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run model validation on update
      useFindAndModify: false, // Use native findOneAndUpdate() instead of deprecated findAndModify()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message, // Optional: Send detailed error message in development
    });
  }
});


// update user
const updateUser = Trycatch(async (req, res, next) => {
  if (req.body.mobileNumber) {
    // find mobile number
    const mobileNumberCheck = await User.findOne({
      mobileNumber: req.body.mobileNumber,
    });
    if (mobileNumberCheck) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists",
      });
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  // remove cache
  cache.del("users");
  cache.del("totalUsers");

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

// get all users
const getAllUsers = Trycatch(async (req, res, next) => {
  // check cache
  if (cache.has("users")) {
    const users = cache.get("users");
    const totalUsers = cache.get("totalUsers");
    return res.status(200).json({
      success: true,
      users,
      totalUsers,
    });
  } else {
    const users = await User.find();
    const totalUsers = users.length;
    cache.set("users", users, 10);
    cache.set("totalUsers", totalUsers, 10);
    res.status(200).json({
      success: true,
      totalUsers,
      users,
    });
  }
});

// delete user
const deleteUser = Trycatch(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  await user.remove();
  // remove cache
  cache.del("users");
  cache.del("totalUsers");

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// get single user
const getSingleUser = Trycatch(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// forgot password

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
// otp
var OTPs = {};

// send otp and update password
const ForgotPassword = Trycatch(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // check user us exist or not
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  // generate otp
  const OTP = generateOTP();
  OTPs[email] = OTP;

  // send otp
  try {
    await Mail(
      email,
      "Password Reset OTP",
      `Your OTP for resetting the password is: ${OTP}. Please do not share this OTP with anyone.`
    );
    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// check otp
const checkOTP = Trycatch(async (req, res, next) => {
  const { email, OTP } = req.body;
  if (OTPs[email] !== OTP) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  } else {
    // remove OTP
    delete OTPs[email];
  }

  res.status(200).json({
    success: true,
    message: "OTP verified",
  });
});

// reset password with OTP
const resetPasswordWithOTP = Trycatch(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  // if user does not exist
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  // update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

// Send Email to All Registered Users
const sendEmailToAllUsers = Trycatch(async (req, res, next) => {
  const { template } = req.body;
  // Fetch all registered users
  const users = await User.find();

  // Check if there are any users
  if (users.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No users found",
    });
  }

  let emailsSentCount = 0;

  // Send email to each user
  for (let user of users) {
    await Mail(
      user.email,
      "Test email from vaibhav ",
      "This is testing email from Sk-Food E-com.",
      template
    );
    emailsSentCount++;
  }

  res.status(200).json({
    success: true,
    message: "Email sent to all registered users",
    usersCount: users.length,
    emailsSentCount: emailsSentCount,
  });
});

// export all
module.exports = {
  RegisterUser,
  LoginUser,
  myProfile,
  updateUser,
  getAllUsers,
  deleteUser,
  getSingleUser,
  ForgotPassword,
  resetPasswordWithOTP,
  sendEmailToAllUsers,
  checkOTP,
  updateProfileById
};
