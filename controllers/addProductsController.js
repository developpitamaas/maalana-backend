const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const Products = require("../models/AddProducts");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to extract numeric value from string
const parseNumericValue = (value) => {
    if (typeof value === "string") {
        const numericValue = value.replace(/[^\d.]/g, ""); // Removes all non-numeric characters except the dot
        return parseFloat(numericValue) || 0; // Convert to float, default to 0 if NaN
    }
    return value;
};

const addProducts = async (req, res) => {
    try {
        const {
            name, price, quantity, flavour, itemForm, ingredients,
            calories, protein, carbohydrates, fat, fiber, sugar,
            sodium, cholesterol, category, foodCategory, brand, description,
            images
        } = req.body;

        // Validate required fields
        if (!name || !price || !quantity) {
            return res.status(400).json({ message: "Name, price, and quantity are required fields." });
        }

        let imageUrls = [];

        // Upload all images directly
        if (images && images.length > 0) {
            for (const image of images) {
                try {
                    const uploadResponse = await cloudinary.uploader.upload(image, {
                        folder: "products", // Folder in Cloudinary
                    });
                    imageUrls.push(uploadResponse.secure_url); // Storing the secure_url
                } catch (uploadError) {
                    console.error("Error uploading image:", uploadError);
                    return res.status(400).json({ message: "Error uploading image", error: uploadError.message });
                }
            }
        }

        // Sanitize numeric fields
        const sanitizedProduct = {
            name,
            price,
            quantity,
            flavour,
            itemForm,
            ingredients,
            calories: parseNumericValue(calories),
            protein: parseNumericValue(protein),
            carbohydrates: parseNumericValue(carbohydrates),
            fat: parseNumericValue(fat),
            fiber: parseNumericValue(fiber),
            sugar: parseNumericValue(sugar),
            sodium: parseNumericValue(sodium),
            cholesterol: parseNumericValue(cholesterol),
            category,
            foodCategory,
            brand,
            description,
            images: imageUrls
        };

        // Create a new product using the sanitized data
        const newProduct = new Products(sanitizedProduct);

        // Save the new product to the database
        await newProduct.save();

        // Send a success response
        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Products.find();
        res.status(200).json({ message: "Products fetched successfully", products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// get single product
const getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.id.trim();  // ✅ Trim whitespace

        // ✅ Check for a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Products.findById({ _id: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product fetched successfully", product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// delete product by id
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id.trim();  // ✅ Trim whitespace

        // ✅ Check for a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // Find the product by ID
        const product = await Products.findById({ _id: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete the product from the database
        await Products.deleteOne({ _id: productId });

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Edit product by id
const editProduct = async (req, res) => {
    try {
        const productId = req.params.id.trim();  // ✅ Trim whitespace

        // ✅ Check for a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // Find the product by ID
        const product = await Products.findById({ _id: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update the product in the database
        const updatedProduct = await Products.findByIdAndUpdate(
            { _id: productId },
            { $set: req.body },
            { new: true }
        );

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { addProducts, getAllProducts, getSingleProduct, deleteProduct, editProduct };
