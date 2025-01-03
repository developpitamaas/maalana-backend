// controllers/productController.js
const Product = require('../../model/maalanaProduct/index');

const addProduct = async (req, res) => {
    try {
        const images = req.files.map((file) => file.path);
        const { name, price, quantity, flavour, itemForm, ingredients, calories, protein, carbohydrates, fat, fiber, sugar, sodium, cholesterol, category, foodCategory, brand, description, aboutItems } = req.body;

        const newProduct = new Product({
            name,
            price,
            quantity,
            flavour,
            itemForm,
            ingredients,
            calories,
            protein,
            carbohydrates,
            fat,
            fiber,
            sugar,
            sodium,
            cholesterol,
            category,
            foodCategory,
            brand,
            description,
            aboutItems: JSON.parse(aboutItems), // Parse if sent as a JSON string
            images,
        });

        await newProduct.save();
        res.status(200).json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = { addProduct };
