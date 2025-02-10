const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "" },
    landmark: { type: String, default: "" },
});

const userSchema = new mongoose.Schema({
    profileImage: { type: String, default: "/user-profile.jpg" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    role: { type: String, default: "User" },
    dob: { type: Date },
    gender: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    googleId: { type: String, unique: true, sparse: true }, // Sparse for users not using Google login
    password: { type: String }, // Optional for Google login
    address: { type: addressSchema, default: () => ({}) },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
