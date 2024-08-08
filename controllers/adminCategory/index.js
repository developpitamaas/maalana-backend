const Category = require('../../model/adminCategory/index');
const path = require('path');
const fs = require('fs');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({
            data: categories,
            success: true,
            message: 'Categories fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCategory = async (req, res) => {
    const { label } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const newCategory = new Category({ label, imageURL: image });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCategory = async (req, res) => {
    const { label } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (image) {
            if (category.imageURL) {
                fs.unlinkSync(path.join(__dirname, '..', category.imageURL));
            }
            category.imageURL = image;
        }

        category.label = label;
        await category.save();
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (category.imageURL) {
            fs.unlinkSync(path.join(__dirname, '..', category.imageURL));
        }

        await category.remove();
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
