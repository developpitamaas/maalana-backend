const BestSellerProduct = require('../../model/BestSellerProduct/index');

// Controller function to get best seller products
exports.getBestSellers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Limit the number of products returned
        const bestSellers = await BestSellerProduct.find().sort({ unitsSold: -1 }).limit(limit);
        res.status(200).json({
           data: bestSellers,
           success: true,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve best seller products', error });
    }
};

exports.addProduct = async (req, res) => {
    console.log(req.body);
    try {
        const newProduct = new BestSellerProduct(req.body); // Create a new product using the data in the request body
        const savedProduct = await newProduct.save(); // Save the product to the database
        res.status(201).json({
            message: 'Product added successfully',
            product: savedProduct,
            success: true
        }); // Respond with the saved product
    } catch (error) {
        res.status(500).json({ message: 'Failed to add product', error });
    }
};