const BillingAddress = require("../models/BillingAddress");

// ✅ Save or Update Billing Address
exports.saveBillingAddress = async (req, res) => {
    try {
        const { userId, street, city, state, pincode, country, phone } = req.body;

        let existingAddress = await BillingAddress.findOne({ userId });

        if (existingAddress) {
            // Update if address exists
            existingAddress.street = street;
            existingAddress.city = city;
            existingAddress.state = state;
            existingAddress.pincode = pincode;
            existingAddress.country = country;
            existingAddress.phone = phone;
            await existingAddress.save();
            return res.status(200).json({ message: "Billing address updated successfully", address: existingAddress });
        }

        // Create a new address if not found
        const newBillingAddress = new BillingAddress({ userId, street, city, state, pincode, country, phone });
        await newBillingAddress.save();
        res.status(201).json({ message: "Billing address saved successfully", address: newBillingAddress });

    } catch (error) {
        console.error("Error saving billing address:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// ✅ Get Billing Address by User ID
exports.getBillingAddress = async (req, res) => {
    try {
        const { userId } = req.params;
        const billingAddress = await BillingAddress.findOne({ userId });

        if (!billingAddress) {
            return res.status(404).json({ message: "Billing address not found" });
        }

        res.status(200).json({ billingAddress });
    } catch (error) {
        console.error("Error fetching billing address:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
