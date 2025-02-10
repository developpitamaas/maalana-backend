const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"]
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"]
    },
    flavour: String,
    itemForm: String,
    ingredients: String,
    calories: { type: Number, min: [0, "Calories cannot be negative"] },
    protein: { type: Number, min: [0, "Protein cannot be negative"] },
    carbohydrates: { type: Number, min: [0, "Carbohydrates cannot be negative"] },
    fat: { type: Number, min: [0, "Fat cannot be negative"] },
    fiber: { type: Number, min: [0, "Fiber cannot be negative"] },
    sugar: { type: Number, min: [0, "Sugar cannot be negative"] },
    sodium: { type: Number, min: [0, "Sodium cannot be negative"] },
    cholesterol: { type: Number, min: [0, "Cholesterol cannot be negative"] },
    category: {
      type: String,
      enum: [
        "Imli Ladoo",
        "Family Candy Pack",
        "Lollipop",
        "Candy",
        "Aam Papad",
        "Fruit Katli"
      ],
    },
    foodCategory: {
      type: String,
      enum: ["Sweets", "Savory", "Beverages", "Vegetarian", "Non-Vegetarian", ""], // ✅ Allowing empty string if optional
      default: "", // Set default to an empty string
    },
    brand: String,
    description: String,
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
