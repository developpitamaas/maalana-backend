const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    user: { type: String, required: true }, // Can be "Customer", "Admin", "System"
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
