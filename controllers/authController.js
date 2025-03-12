const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Read Email Template
const emailTemplatePath = path.join(__dirname, "../templates/welcomeEmail.html");
const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'sachingautam6239@gmail.com',
        pass: 'nxajuvwkblihqind',
    },
});

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Signup
exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id);
        // Replace placeholders with actual values
        const personalizedEmail = emailTemplate
            .replace("{{USER_NAME}}", firstName)
            .replace("{{YEAR}}", new Date().getFullYear());

        // Send Welcome Email
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Welcome to Maalana!",
            html: personalizedEmail,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.password) return res.status(400).json({ message: "This user uses Google Login" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log(isPasswordCorrect);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user._id);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

// Google Login
exports.googleLogin = async (req, res) => {
    const { email, googleId, name, familyName, givenName, imageUrl } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                googleId,
                email,
                firstName: givenName,
                lastName: familyName,
                profileImage: imageUrl,
            });
        }

        const token = generateToken(user._id);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.getUserDetails = async (req, res) => {
    const { userId } = req.params; // User ID from request params

    try {
        const user = await User.findById(userId).select("-password -__v"); // Exclude sensitive fields like password and __v
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User details fetched successfully", user });
    } catch (error) {
        console.error("Error fetching user details:", error.message);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};


exports.updateUserDetails = async (req, res) => {
    try {
        const { userId, firstName, lastName, role, gender, email, phone, address, profileImage, dob } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(400).json({ message: "_id is required" });
        }

        // Find the user by _id
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Upload profile image to Cloudinary if a new image is provided
        let uploadedImageUrl = user.profileImage; // Use existing profile image if no new one is provided
        if (profileImage && profileImage.startsWith("data:image")) {
            const uploadResponse = await cloudinary.uploader.upload(profileImage, {
                folder: "user_profiles", // Folder in Cloudinary
                public_id: `profile_${userId}`, // Unique public ID
                overwrite: true, // Overwrite if already exists
            });
            uploadedImageUrl = uploadResponse.secure_url; // Cloudinary's secure URL
        }

        // ✅ Handle DOB properly (convert to Date format)
        let formattedDOB = user.dob; // Keep existing DOB if not updated
        if (dob) {
            formattedDOB = new Date(dob);
            if (isNaN(formattedDOB)) {
                return res.status(400).json({ message: "Invalid Date of Birth format" });
            }
        }

        // Update user details
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.role = role || user.role;
        user.gender = gender || user.gender;
        user.email = email || user.email;
        user.dob = formattedDOB;
        user.phone = phone || user.phone;
        user.profileImage = uploadedImageUrl; // Set Cloudinary URL

        // Update address if provided
        if (address) {
            user.address.street = address.street || user.address.street;
            user.address.city = address.city || user.address.city;
            user.address.state = address.state || user.address.state;
            user.address.pincode = address.pincode || user.address.pincode;
            user.address.country = address.country || user.address.country;
            user.address.landmark = address.landmark || user.address.landmark;
        }

        // Save the updated user
        const updatedUser = await user.save();

        // Send success response
        res.status(200).json({
            message: "User details updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user details:", error);
        res.status(500).json({
            message: "An error occurred while updating user details",
            error: error.message,
        });
    }
};

