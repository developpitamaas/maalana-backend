const BaatCheet = require("../models/BaatCheet");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'sachingautam6239@gmail.com',
        pass: 'nxajuvwkblihqind',
    },
});

exports.submitBaatCheet = async (req, res) => {
    try {
        const { name, phone, email, message } = req.body;

        if (!name || !phone || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const newEntry = new BaatCheet({ name, phone, email, message });
        await newEntry.save();

        // Load Email Templates
        const adminEmailTemplatePath = path.join(__dirname, "../templates/baat-cheet-admin.html");
        const userEmailTemplatePath = path.join(__dirname, "../templates/baat-cheet-user.html");

        let adminEmailHtml = fs.readFileSync(adminEmailTemplatePath, "utf-8");
        let userEmailHtml = fs.readFileSync(userEmailTemplatePath, "utf-8");

        // Replace placeholders with actual data
        adminEmailHtml = adminEmailHtml
            .replace("{{name}}", name)
            .replace("{{phone}}", phone)
            .replace("{{email}}", email)
            .replace("{{message}}", message);

        userEmailHtml = userEmailHtml
            .replace("{{name}}", name)
            .replace("{{message}}", message);

        // Send Admin Email
        const adminMailOptions = {
            from: email,
            to: "sachin.pitamaasweb@gmail.com",
            subject: "New Baat Cheet Submission",
            html: adminEmailHtml,
        };

        // Send User Email
        const userMailOptions = {
            from: "sachingautam6239@gmail.com",
            to: email,
            subject: "Thank You for Your Submission",
            html: userEmailHtml,
        };

        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        res.status(201).json({ success: true, message: "Baat Cheet form submitted successfully! Emails sent." });
    } catch (error) {
        console.error("❌ Error in Baat Cheet submission:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
