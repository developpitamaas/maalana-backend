const HumkoJoinKarlo = require("../models/HumkoJoinKarlo");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

exports.submitHumkoJoinKarlo = async (req, res) => {
    try {
        const { firstName, lastName, companyName, phone, email, message } = req.body;

        if (!firstName || !lastName || !companyName || !phone || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        // Save to database
        const newEntry = new HumkoJoinKarlo({ firstName, lastName, companyName, phone, email, message });
        await newEntry.save();

        // Send emails to user and admin
        await sendEmails(firstName, lastName, companyName, phone, email, message);

        res.status(201).json({ success: true, message: "Humko Join Karlo form submitted successfully!" });
    } catch (error) {
        console.error("❌ Error in Humko Join Karlo submission:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Function to send both user and admin emails
const sendEmails = async (firstName, lastName, companyName, phone, email, message) => {
    try {
        // Configure Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'sachingautam6239@gmail.com',
                pass: 'nxajuvwkblihqind',
            },
        });

        // ✅ Load email templates
        const adminEmailTemplatePath = path.join(__dirname, "../templates/joinTemplate.html");
        let adminEmailTemplate = fs.readFileSync(adminEmailTemplatePath, "utf-8");

        const userEmailTemplatePath = path.join(__dirname, "../templates/userConfirmation.html");
        let userEmailTemplate = fs.readFileSync(userEmailTemplatePath, "utf-8");

        // ✅ Replace placeholders with actual data
        adminEmailTemplate = adminEmailTemplate
            .replace("{{firstName}}", firstName)
            .replace("{{lastName}}", lastName)
            .replace("{{companyName}}", companyName)
            .replace("{{phone}}", phone)
            .replace("{{email}}", email)
            .replace("{{message}}", message);

        userEmailTemplate = userEmailTemplate
            .replace("{{firstName}}", firstName)
            .replace("{{companyName}}", companyName);

        // ✅ Admin Email (Notification)
        const adminMailOptions = {
            from: email,
            to: "sachin.pitamaasweb@gmail.com", // Change to actual admin email
            subject: "New Humko Join Karlo Submission",
            html: adminEmailTemplate,
        };

        // ✅ User Email (Confirmation)
        const userMailOptions = {
            from:"sachingautam6239@gmail.com",
            to: email,
            subject: "Welcome to Maalana Family - Confirmation",
            html: userEmailTemplate,
        };

        // ✅ Send both emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);
        console.log("📩 Emails sent successfully (Admin & User)");
    } catch (error) {
        console.error("❌ Error sending emails:", error);
    }
};
