const Banner = require("../models/Banner");
const cloudinary = require("../config/cloudinary");

// ✅ Get All Banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ banners });
  } catch (error) {
    res.status(500).json({ message: "Error fetching banners", error: error.message });
  }
};

// ✅ Add New Banner (Cloudinary Upload)
exports.addBanner = async (req, res) => {
  try {
    const { title, link, page, position } = req.body;
    if (!title || !req.files.length > 0 || !page || !position) {
      return res.status(400).json({ message: "Title and images are required" });
    }

    const images = [];

    // ✅ Convert Buffer to Base64 for Cloudinary
    for (const file of req.files) {
      const uploadedImage = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file.buffer.toString("base64")}`, {
        folder: "banners",
      });
      images.push(uploadedImage.secure_url);
    }

    const newBanner = new Banner({ title, images, link, page, position });   
    await newBanner.save();

    res.status(201).json({ message: "Banner added successfully", banner: newBanner });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { title, link, page, position } = req.body;
    let images = [];

    // ✅ Handle Image Upload (Convert Buffer to Base64)
    if (req.files.length > 0) {
      for (const file of req.files) {
        const uploadedImage = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file.buffer.toString("base64")}`, {
          folder: "banners",
        });
        images.push(uploadedImage.secure_url);
      }
    }

    // ✅ Merge new images with existing ones
    const existingBanner = await Banner.findById(req.params.id);
    if (!existingBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        title,
        link,
        images: images.length > 0 ? images : existingBanner.images, // Keep old images if none uploaded
        position,
        page ,
      },
      { new: true }
    );

    res.status(200).json({ message: "Banner updated successfully", banner: updatedBanner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
    if (!deletedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting banner", error: error.message });
  }
};
