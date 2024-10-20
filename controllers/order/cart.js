const axios = require('axios');
const mongoose = require('mongoose');
const Cart = require("../../model/order/cart");
const TryCatch = require("../../middleware/Trycatch");
const Product = require("../../model/Product/product");

const addToCart = TryCatch(async (req, res, next) => {
  const { productId, quantity, shippingPrice, CoupanCode, id, } = req.body;
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
    const response = await axios.get(`http://localhost:8000/api/get-all-cart-by-user/${id}`);
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
      cartQuantity: 1,
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

  // Validate input
  if (!userId || !cartId) {
    return res.status(400).json({ success: false, message: 'User ID and cart ID are required.' });
  }

  // Check if the provided cartId exists and belongs to the user
  const existingCart = await Cart.findOne({ _id: cartId, userId: userId });
  if (!existingCart) {
    return res.status(404).json({ success: false, message: 'Cart not found for the provided user and cart ID.' });
  }

  // Delete the cart item
  const cartDeleted = await Cart.deleteOne({ _id: cartId });
  if (cartDeleted.deletedCount === 1) {
    // Fetch the updated cart for the user
    try {
      const userCarts = await Cart.find({ userId: userId });

      // If there are still carts, fetch the updated cart
      if (userCarts.length > 0) {
        const url = `http://localhost:8000/api/get-all-cart-by-user/${userId}`;
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
          totalQuantity,
          totalPrice,
          cartQuantity:0
        });
      } else {
        // If it was the last cart item for the user
        return res.status(200).json({
          success: true,
          message: 'All cart items removed successfully. No items left in the cart.',
          totalQuantity: 0,
          totalPrice: 0,
          cartQuantity:0
        });
      }
    } catch (error) {
      console.error(`Error fetching updated cart for userId ${userId}: ${error.response ? error.response.data : error.message}`);
      return res.status(500).json({ success: false, message: 'Failed to fetch updated cart after deletion.' });
    }
  } else {
    // If the cart item was not deleted
    return res.status(500).json({ success: false, message: 'Failed to delete the cart item.' });
  }
});


const increaseQuantity = TryCatch(async (req, res, next) => {
  const { cartId, productId, quantity, userId } = req.body; // Include userId to fetch cart after updating

  try {
    // Validate input
    if (!cartId || !productId || quantity <= 0 || !userId) {
      return res.status(400).json({ success: false, message: 'Invalid input data.' });
    }

    // Find the cart
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if the item exists in the cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in the cart.' });
    }

    // Increase the quantity
    cart.items[itemIndex].quantity += quantity;

    // Save the cart
    await cart.save();

    // Calculate total price
    const totalPrice = cart.items[itemIndex].quantity * product.price;

    // Fetch the updated cart details
    const url = `http://localhost:8000/api/get-all-cart-by-user/${userId}`;

    const response = await axios.get(url);

    // Calculate total quantity and total price
    let totalQuantity = 0;
    let totalPriceAfterFetch = 0;

    response.data.cart.forEach(cartItem => {
      cartItem.items.forEach(item => {
        totalQuantity += item.quantity;
        totalPriceAfterFetch += item.quantity * item.productId.price;
      });
    });

    return res.status(200).json({
      success: true,
      totalPrice: totalPrice,
      subTotalPrice: totalPriceAfterFetch,
      totalQuantity: totalQuantity,
      cartQuantity: cart.items[itemIndex] ? cart.items[itemIndex].quantity : 0, 
      message: 'Quantity increased successfully and cart updated.'
    });
  } catch (error) {
    console.error('Error increasing quantity:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


const decreaseQuantity = TryCatch(async (req, res, next) => {
  const { cartId, productId, quantity, userId } = req.body; // Include userId to fetch cart after updating
  try {
    // Validate input
    if (!cartId || !productId || quantity <= 0 || !userId) {
      return res.status(400).json({ success: false, message: 'Invalid input data.' });
    }

    // Find the cart
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if the item exists in the cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in the cart.' });
    }

    // Decrease the quantity
    cart.items[itemIndex].quantity -= quantity;

    // Ensure quantity doesn't go below 1
    if (cart.items[itemIndex].quantity < 1) {
      cart.items.splice(itemIndex, 1); // Remove item from cart if quantity is less than 1
    }

    // Save the cart
    await cart.save();

    // Calculate updated total price for the product
    const totalPrice = cart.items[itemIndex] ? cart.items[itemIndex].quantity * product.price : 0;

    // Fetch the updated cart details
    const url = `http://localhost:8000/api/get-all-cart-by-user/${userId}`;

    const response = await axios.get(url);

    // Calculate total quantity and total price after fetch
    let totalQuantity = 0;
    let totalPriceAfterFetch = 0;
    response.data.cart.forEach(cartItem => {
      console.log('cartItem', cartItem);
      cartItem.items.forEach(item => {
        totalQuantity += item.quantity;
        totalPriceAfterFetch += item.quantity * item.productId.price;
      });
    });

    return res.status(200).json({
      success: true,
      totalQuantity: totalQuantity,
      totalPrice: totalPrice,
      subTotalPrice: totalPriceAfterFetch,
      cartQuantity: cart.items[itemIndex] ? cart.items[itemIndex].quantity : 0, 
      message: 'Quantity decreased successfully and cart updated.'
    });
  } catch (error) {
    console.error('Error decreasing quantity:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
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
  deleteCartProduct,
  increaseQuantity,
  decreaseQuantity
};
