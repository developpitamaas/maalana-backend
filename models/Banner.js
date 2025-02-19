const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    images: [{ type: String, required: true }], // Cloudinary image URLs
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    page: { 
      type: String, 
      enum: ["home", "product", "about", "contact", "partner"], 
      required: true 
    },
    position: {
      type: String,
      enum: ["top", "center", "bottom"],
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
