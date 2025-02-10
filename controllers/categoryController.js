const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const Category = require("../models/Category");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.addCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    // Upload the image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "category", // Folder in Cloudinary
    });

    // Create a new category with the image URL and name
    const newCategory = new Category({
      name,
      imageUrl: uploadResponse.secure_url,
    });

    // Save the category to the database
    await newCategory.save();

    res.status(201).json({ message: "Category added successfully", newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add category" });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();

    res.status(200).json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    console.error(error);   
    res.status(500).json({ message: "Failed to fetch categories" });
  }
}

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    // Find the category by ID
    const category = await Category.findById({ _id: id });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Upload the new image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "category", // Folder in Cloudinary
    });

    // Update the category with the new image URL and name
    category.name = name;
    category.imageUrl = uploadResponse.secure_url;

    // Save the updated category to the database
    await category.save();

    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category by ID
    const category = await Category.findById({ _id: id });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete the category from the database
    await Category.deleteOne({ _id: id });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};