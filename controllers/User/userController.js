const Trycatch = require("../../middleware/Trycatch");
const User = require("../../model/User/users");
const sendToken = require("../../utils/userToken");
const Mail = require("../../utils/sendmail");
const OTP = require("../../model/otpModel");

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

  const currentYear = new Date().getFullYear();
  const yearRange = `${currentYear}-${currentYear + 1}`;

  // HTML Email Template with Dynamic Content
  const emailTemplate = `
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Thank You For Registering</title>
       <style>
           body {
               font-family: Arial, sans-serif;
               max-width: 600px;
               margin: 0 auto;
               padding: 20px;
               background-color: #ffffff;
               color: #333333;
               line-height: 1.6;
           }
           .logo {
               max-width: 200px;
               margin-bottom: 20px;
           }
           h1 {
               color: #9ACA3C;
               font-size: 36px;
               margin-bottom: 20px;
           }
           ul {
               padding-left: 20px;
           }
           .website {
               font-weight: bold;
               margin: 20px 0;
           }
           .footer {
               margin-top: 30px;
               font-size: 14px;
               color: #666666;
           }
       </style>
   </head>
   <body>
       <img src="https://res.cloudinary.com/dtivafy25/image/upload/v1725260985/logo-1_rqojr8.png" alt="Maalana Logo" class="logo">
       <h1>Thank You For Registering</h1>
       <p>Hi ${user.firstName} ${user.lastName},</p>
       <p>Thank you for registering with us! We're excited to have you as part of our community. Your account has been
           successfully created, and you're now all set to start exploring our Maalana Products. To get started, you might
           want to:</p>
       <ul>
           <li>Complete your profile by logging in to your account.</li>
           <li>Check out our latest offerings and exclusive deals.</li>
           <li>Explore our resources to make the most of your new account.</li>
       </ul>
       <p class="website">www.maalana.com</p>
       <p>If you have any questions or need assistance, don't hesitate to reach out to our support team at [Contact
           Information]. We're here to help!</p>
       <p>Thanks again for joining us. We can't wait for you to dive in!</p>
       <p class="footer">©${yearRange} MAAlana Foods All Rights Reserved</p>
   </body>
   </html>`;

  //   send mail
  Mail(
    user.email,
    `Welcome to Maalana, ${user.firstName} ${user.lastName}! 🎉 Your Journey Starts Here!`,
    emailTemplate,
    true
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

const newForgotPassword = Trycatch(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Upsert OTP in the database (update if exists, insert if doesn't)
  const otpEntry = await OTP.findOneAndUpdate(
    { email }, // Filter by email
    { otp, createdAt: new Date() }, // Update the OTP and reset the expiration time
    { upsert: true, new: true, setDefaultsOnInsert: true } // Create a new entry if it doesn't exist
  );

  // Send OTP to user's email
  await Mail(
    email,
    "Password Reset OTP",
    `Your OTP for resetting the password is : ${otp}. Please do not share this OTP with anyone.`
  );

  res.status(200).json({
    success: true,
    message: "OTP sent to your email",
  });
});


// verify otp
const verifyOtp = Trycatch(async (req, res, next) => {
  const { email, otp } = req.body;

  // Find the OTP entry for the given email
  const otpEntry = await OTP.findOne({ email });

  // Check if OTP entry exists
  if (!otpEntry) {
    return res.status(404).json({
      success: false,
      message: "OTP not found. Please request a new OTP.",
    });
  }

  // Check if the OTP is correct
  console.log(otpEntry.otp, otp);
  if (otpEntry.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  }

  // OTP is valid, proceed with the password reset or other actions
  res.status(200).json({
    success: true,
    message: "OTP verified successfully.",
  });

  // Optionally, delete the OTP entry after successful verification
  await OTP.deleteOne({ email });
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
  updateProfileById,
  newForgotPassword,
  verifyOtp
};
