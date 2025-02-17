// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/AddProducts');

// ✅ Add Product to Cart
exports.addToCart = async (req, res) => {
    const { productId, quantity, userId } = req.body;

    if (!productId || quantity == null || !userId) {
        return res.status(400).json({ message: 'Product ID, quantity, and user ID are required.' });
    }

    try {
        let cartItem = await Cart.findOne({ productId, userId });

        if (cartItem) {
            cartItem.quantity = Math.min(cartItem.quantity + quantity, 10);
            await cartItem.save();
            return res.status(200).json({
                message: 'Quantity updated successfully.',
                cartItem
            });
        } else {
            cartItem = new Cart({ productId, userId, quantity: Math.min(quantity, 10) });
            await cartItem.save();
            return res.status(201).json({
                message: 'Product added to cart successfully.',
                cartItem
            });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// ✅ Get Cart for a Specific User (Fixed)
exports.getCart = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    try {
        const cartItems = await Cart.find({ userId }).populate({
            path: "productId",
            select: "name price images",
            model: Product
        });

        if (!cartItems.length) {
            return res.status(404).json({ message: "Cart is empty.", cart: [] });
        }

        // ✅ Filter out items where the product reference is null
        const validCartItems = cartItems.filter(item => item.productId !== null);

        // ✅ Format cart response
        const formattedCart = validCartItems.map(item => {
            const product = item.productId;

            return {
                _id: item._id,
                quantity: item.quantity,
                totalPrice: product.price * item.quantity,
                product: {
                    id: product._id,
                    name: product.name,
                    unitPrice: product.price,
                    image: product.images[0] || ''
                }
            };
        });
        res.status(200).json({ cart: formattedCart });

    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// ✅ Remove Product from Cart for a Specific User
exports.removeFromCart = async (req, res) => {
    const { productId, userId } = req.params;

    if (!productId || !userId) {
        return res.status(400).json({ message: 'Product ID and User ID are required.' });
    }

    try {
        const deletedItem = await Cart.findOneAndDelete({ productId, userId });

        if (!deletedItem) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

        res.status(200).json({ message: 'Product removed from cart successfully.' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// ✅ Update Quantity in Cart for a Specific User
exports.updateQuantity = async (req, res) => {
    const { productId, quantity, userId } = req.body;

    if (!productId || quantity == null || !userId) {
        return res.status(400).json({ message: 'Product ID, quantity, and user ID are required.' });
    }

    try {
        let cartItem = await Cart.findOne({ productId, userId }).populate({
            path: 'productId',
            select: 'name price images',
            model: Product
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

        if (quantity <= 0) {
            await Cart.findOneAndDelete({ productId, userId });
            return res.status(200).json({ message: 'Product removed from cart as quantity was set to 0.' });
        } else {
            cartItem.quantity = Math.min(quantity, 10);
            await cartItem.save();
        }

        const product = cartItem.productId;
        const totalPrice = product.price * cartItem.quantity;

        res.status(200).json({
            message: 'Quantity updated successfully.',
            cartItem: {
                _id: cartItem._id,
                quantity: cartItem.quantity,
                totalPrice,
                product: {
                    id: product._id,
                    name: product.name,
                    unitPrice: product.price,
                    image: product.images[0] || ''
                }
            }
        });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


// ✅ Get Cart Length by User ID
exports.getCartLength = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const cartItems = await Cart.find({ userId });
        const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

        res.status(200).json({ cartLength: totalQuantity });
    } catch (error) {
        console.error('Error fetching cart length:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
