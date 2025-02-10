const express = require("express");
const router = express.Router();
const { addCategory,getAllCategories, updateCategory, deleteCategory } = require("../controllers/categoryController");

router.post("/add-category", addCategory);
router.get("/get-all-categories", getAllCategories);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", deleteCategory);


module.exports = router;
