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
    ingredientsData: {
      main: [String],
      foodColors: [String],
      flavors: [String]
    },
    nutritionalInfo: {
      energy: { per100gm: Number, perServing: Number, rda: String },
      protein: { per100gm: Number, perServing: String, rda: String },
      carbohydrates: { per100gm: Number, perServing: Number, rda: String },
      totalSugar: { per100gm: Number, perServing: Number, rda: String },
      addedSugar: { per100gm: Number, perServing: Number, rda: String },
      fat: { per100gm: Number, perServing: String, rda: String },
      cholesterol: { per100gm: Number, perServing: String, rda: String },
      sodium: { per100gm: Number, perServing: Number, rda: String }
    },
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
      enum: ["Sweets", "Savory", "Beverages", "Vegetarian", "Non-Vegetarian", ""],
      default: "",
    },
    brand: String,
    description: String,
    aboutThisItem: [String],
    allergyAdvice: {
      type: Map,
      of: String
    },
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
