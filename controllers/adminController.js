const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// // Admin Login Controller
// exports.loginAdmin = async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: "Email and password are required" });
//     }

//     try {
//         const admin = await Admin.findOne({ email });
//         if (!admin) {
//             return res.status(404).json({ message: "Admin not found" });
//         }

//         const isPasswordValid = await bcrypt.compare(password, admin.password);
//         if (!isPasswordValid) {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
//             expiresIn: "1h",
//         });

//         res.status(200).json({ message: "Login successful", token });
//     } catch (error) {
//         console.error("Error during admin login:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };


exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    // ✅ Static Admin Credentials
    const STATIC_ADMIN_EMAIL = "maalana@12345.com"; // Change as needed
    const STATIC_ADMIN_PASSWORD = "maalana@12345"; // Change as needed

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // ✅ Check static credentials
        if (email !== STATIC_ADMIN_EMAIL || password !== STATIC_ADMIN_PASSWORD) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ✅ Generate Admin Token
        const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.signupAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            email,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(201).json({ message: "Admin created successfully", admin, token });
    } catch (error) {
        console.error("Error during admin signup:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}