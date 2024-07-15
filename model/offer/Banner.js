const mongoose = require("mongoose");

// Define banner schema
const bannerSchema = new mongoose.Schema({
    bannerImage: {
        type: String,
        required: true,
    },
    BannerFor : {
        type: String,
    },
});

// Export banner model
const Banner = mongoose.model("banner", bannerSchema);

module.exports = Banner;