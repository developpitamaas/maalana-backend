const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");
require("dotenv").config();


// Read email template
const emailTemplatePath = path.join(__dirname, "../templates/otpTemplate.html");
const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

// Temporary OTP storage (Use Redis in production)
const otpStorage = {};

// Generate a 4-digit OTP
const generateOTP = () => {
    return crypto.randomInt(1000, 9999).toString();
};


// Configure Nodemailer Transporter
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    // auth: {
    //   user: 'info@kashishfood.co.nz',
    //   pass: 'dgjy wxvl aanj gmfx',
    // },
    auth: {
        user: 'sachingautam6239@gmail.com',
        pass: 'nxajuvwkblihqind',
    },
});
// Check user existence and send OTP
exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Generate OTP and store it
        const otp = generateOTP();
        otpStorage[email] = { otp, expiresAt: Date.now() + 300000 }; // Valid for 5 mins
        // Replace OTP in email template
        const htmlContent = emailTemplate.replace("{{OTP_CODE}}", otp);
        // Send OTP via email
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Your OTP Code",
            html: htmlContent,
        };

        await emailTransporter.sendMail(mailOptions);
        res.status(200).json({ message: "OTP sent successfully", email });
    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};

// Verify OTP
exports.verifyOTP = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const storedOTP = otpStorage[email];

    if (!storedOTP) {
        return res.status(400).json({ message: "No OTP found for this email" });
    }

    if (Date.now() > storedOTP.expiresAt) {
        return res.status(400).json({ message: "OTP expired" });
    }

    if (storedOTP.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStorage[email]; // Remove OTP after successful verification
    res.status(200).json({ message: "OTP verified successfully" });
};


exports.resetPassword = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and new password are required." });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
};