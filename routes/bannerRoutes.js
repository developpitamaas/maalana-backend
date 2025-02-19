const express = require("express");
const multer = require("multer");
const { 
  getBanners, 
  addBanner, 
  updateBanner, 
  deleteBanner 
} = require("../controllers/bannerController");

const router = express.Router();

// ✅ Multer Configuration for Cloudinary Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ API Routes
router.get("/get-banners", getBanners);
router.post("/post-banners", upload.array("images", 5), addBanner);
router.put("/:id", upload.array("images", 5), updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;
