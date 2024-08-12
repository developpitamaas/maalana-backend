const Product = require('../../model/adminProductAdd/index'); 

const addProduct = async (req, res) => {
  try {
    const productData = req.body;
console.log(productData);
    const newProduct = new Product(productData);
    await newProduct.save();

    res.status(200).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getAllProducts = async (req, res) => {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  const getProductById = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

const updateProduct = async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  const deleteProduct = async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product deleted successfully', product });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  // get the product by category 

  const getProductByCategory = async (req, res) => {
    try {
      const products = await Product.find({ category: req.params.category });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

module.exports = { 
    addProduct, 
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductByCategory
 };