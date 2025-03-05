const ShippingAddress = require("../models/ShippingAddress");

// 📌 Get all shipping addresses by User ID
exports.getShippingAddresses = async (req, res) => {
    try {
        const { userId } = req.params;
        const shipping = await ShippingAddress.findOne({ userId });

        if (!shipping) {
            return res.status(404).json({ message: "No shipping addresses found" });
        }

        res.status(200).json({ shipping });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// 📌 Add a new shipping address
exports.addShippingAddress = async (req, res) => {
    try {
        const { userId } = req.params;
        const newAddress = req.body;

        let shipping = await ShippingAddress.findOne({ userId });

        if (!shipping) {
            shipping = new ShippingAddress({ userId, addresses: [newAddress] });
        } else {
            shipping.addresses.push(newAddress);
        }

        await shipping.save();
        res.status(201).json({ message: "Shipping address added", shipping });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// 📌 Update a shipping address by ID 
exports.updateShippingAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;
        const updatedAddress = req.body;

        const shipping = await ShippingAddress.findOne({ userId });

        if (!shipping) {
            return res.status(404).json({ message: "Shipping address not found" });
        }

        const addressIndex = shipping.addresses.findIndex((address) => address._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ message: "Shipping address not found" });
        }

        shipping.addresses[addressIndex] = updatedAddress;
        await shipping.save();

        res.status(200).json({ message: "Shipping address updated", shipping });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// 📌 Delete a shipping address by ID

exports.deleteShippingAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;

        const shipping = await ShippingAddress.findOne({ userId });

        if (!shipping) {
            return res.status(404).json({ message: "Shipping address not found" });
        }

        const addressIndex = shipping.addresses.findIndex((address) => address._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ message: "Shipping address not found" });
        }

        shipping.addresses.splice(addressIndex, 1);
        await shipping.save();

        res.status(200).json({ message: "Shipping address deleted", shipping });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
