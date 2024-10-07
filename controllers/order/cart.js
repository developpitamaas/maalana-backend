const axios = require('axios');
const mongoose = require('mongoose');
const Cart = require("../../model/order/cart");
const TryCatch = require("../../middleware/Trycatch");
const Product = require("../../model/Product/product");

const addToCart = TryCatch(async (req, res, next) => {
  const { productId, quantity, shippingPrice, CoupanCode, id, } = req.body;
  console.log(req.body);
  if (!productId || !quantity) {
    return res.status(400).json({ success: false, message: 'Product ID and quantity are required.' });
  }

  // Find the product to ensure it exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Find or create the cart for the user
  let cart = await Cart.findOne({ user: id });

  if (!cart) {
    // Create a new cart if it doesn't exist
    cart = new Cart({
      userId: id,
      items: [],
    });
  }

  // Check if the product is already in the cart
  const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

  if (existingItemIndex > -1) {
    // Update the quantity of the existing item
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].shippingPrice = shippingPrice;
    cart.items[existingItemIndex].CoupanCode = CoupanCode;
  } else {
    // Add a new item to the cart
    cart.items.push({
      productId: productId,
      quantity,
      shippingPrice,
      CoupanCode,
    });
  }

  // Save the cart
  await cart.save();

  let totalQuantity = 0;
  let totalPrice = 0;

  try {
    const response = await axios.get(`http://maalana-backend.onrender.com/api/get-all-cart-by-user/${id}`);
    const updatedCart = response.data.cart;

    // Calculate total quantity and total price
    updatedCart.forEach(cartItem => {
      cartItem.items.forEach(item => {
        totalQuantity += item.quantity;
        totalPrice += item.quantity * item.productId.price; // Ensure `item.price` exists
      });
    });
    res.status(200).json({
      success: true,
      cart,
      totalQuantity,
      totalPrice,
      message: "Product added to cart successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching updated cart." });
  }
});

// get cart product by user id 

const getCart = TryCatch(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.params.id }).populate("items.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }
  res.status(200).json({ success: true, cart, message: "Cart fetched successfully" });
});

// get all cart product by user id

const getAllCartByUser = TryCatch(async (req, res, next) => {
  const cart = await Cart.find({ userId: req.params.id }).populate({
    path: 'items.productId',
    select: 'name price images nutritionalInfo ingredients'
  });
  if (!cart || cart.length === 0) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  // Calculate the total number of items based on the quantity
  const numberOfItems = cart.reduce((total, cartItem) => {
    const itemCount = cartItem.items.reduce((sum, item) => sum + item.quantity, 0);
    return total + itemCount;
  }, 0);

  res.status(200).json({
    success: true,
    cart,
    numberOfItems,
    message: "Cart fetched successfully"
  });
});

// get all cart product 

const getAllCart = TryCatch(async (req, res, next) => {
  const cart = await Cart.find().populate("items.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }
  res.status(200).json({ success: true, cart, message: "Cart fetched successfully" });
});



// update the product quantity in cart by user id and product id
const updateCart = TryCatch(async (req, res, next) => {
  const { productId, quantity, userId, cartId } = req.body;

  // Validate input
  if (!productId || !quantity && quantity !== 0 || !userId || !cartId) {
    return res.status(400).json({ success: false, message: 'Product ID, quantity, user ID, and cart ID are required.' });
  }

  // Find the cart for the user
  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  // Find the product in the cart
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Find the item in the cart
  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found in the cart.' });
  }

  if (quantity === 0) {
    // Remove the item from the cart if quantity is 0
    cart.items.splice(itemIndex, 1);
  } else {
    // Update the quantity of the item
    cart.items[itemIndex].quantity = quantity;
  }

  // Save the cart
  await cart.save();

  // Calculate total quantity and total price
  let totalQuantity = 0;
  let totalPrice = 0;

  // Fetch the updated cart for the user
  try {
    const response = await axios.get(`http://maalana-backend.onrender.com/api/get-all-cart-by-user/${userId}`);
    const updatedCart = response.data.cart;

    // Calculate total quantity and total price
    updatedCart.forEach(cartItem => {
      cartItem.items.forEach(item => {
        totalQuantity += item.quantity;
        totalPrice += item.quantity * item.productId.price; // Ensure `item.price` exists
      });
    });


    // Send success response
    return res.status(200).json({
      success: true,
      cart,
      totalQuantity,
      totalPrice,
      message: 'Cart updated successfully.'
    });

  } catch (error) {
    // Handle errors from fetching the updated cart
    return res.status(500).json({ success: false, message: 'Error fetching updated cart.' });
  }

  // res.status(200).json({
  //   success: true,
  //   cart,
  //   message: 'Cart updated successfully.'
  // });
});


// delete cart all product by user id

const deleteCart = TryCatch(async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);

  // Validate input
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  // Delete all carts for the user
  const result = await Cart.deleteMany({ userId });

  // Check if any carts were deleted
  if (result.deletedCount === 0) {
    return res.status(404).json({ success: false, message: 'No carts found for the user.' });
  }

  res.status(200).json({ success: true, message: 'All carts deleted successfully.' });
});

const deleteCartProduct = TryCatch(async (req, res, next) => {
  const { userId, cartId } = req.body;

  console.log(`Deleting cart for userId: ${userId}, cartId: ${cartId}`);

  // Validate input
  if (!userId || !cartId) {
    return res.status(400).json({ success: false, message: 'User ID and cart ID are required.' });
  }

  // Check if the provided cartId exists and belongs to the user
  const existingCart = await Cart.findOne({ _id: cartId, userId: userId });
  if (!existingCart) {
    return res.status(404).json({ success: false, message: 'Cart not found for the provided user and cart ID.' });
  }

  // Check if it is the last cart item for the user
  const userCarts = await Cart.find({ userId: userId });
  console.log(`Total carts found for user: ${userCarts.length}`);

  // If it's the last cart item, proceed to delete it
  const cartDeleted = await Cart.deleteOne({ _id: cartId });
  console.log('Cart deleted:', cartDeleted);

  if (cartDeleted.deletedCount === 1 && userCarts.length === 1) {
    // If it was the last cart item for the user and successfully deleted
    return res.status(200).json({
      success: true,
      message: 'All cart items removed successfully. No items left in the cart.',
      cart: [],
      totalQuantity: 0,
      totalPrice: 0,
    });
  } else if (cartDeleted.deletedCount === 1) {
    // If it was deleted successfully but other carts still exist
    try {
      // Fetch the updated cart for the user
      const url = `https://maalana-backend.onrender.com/api/get-all-cart-by-user/${userId}`;
      console.log(`Fetching updated cart details from URL: ${url}`);
      const response = await axios.get(url);

      // Calculate total quantity and total price
      let totalQuantity = 0;
      let totalPrice = 0;

      response.data.cart.forEach(cartItem => {
        cartItem.items.forEach(item => {
          totalQuantity += item.quantity;
          totalPrice += item.quantity * item.productId.price;
        });
      });

      return res.status(200).json({
        success: true,
        message: 'Cart item removed successfully.',
        cart: response.data.cart,
        totalQuantity,
        totalPrice,
      });
    } catch (error) {
      console.error(`Error fetching updated cart for userId ${userId}: ${error.response ? error.response.data : error.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch updated cart after deletion.' });
    }
  } else {
    // If the cart item was not deleted
    return res.status(500).json({ success: false, message: 'Failed to delete the cart item.' });
  }
});



// export
module.exports = {
  addToCart,
  getCart,
  getAllCart,
  updateCart,
  getAllCartByUser,
  deleteCart,
  deleteCartProduct
};
