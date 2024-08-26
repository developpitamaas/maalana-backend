const Cart = require("../../model/order/cart");
const TryCatch = require("../../middleware/Trycatch");
const Product = require("../../model/Product/product");

const addToCart = TryCatch(async (req, res, next) => {
  const { productId, quantity, shippingPrice, CoupanCode, id } = req.body;
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

  res.status(200).json({
    success: true,
    cart,
    message: "Product added to cart successfully",
  });
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
  const cart = await Cart.find({ userId: req.params.id }).populate("items.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }
  res.status(200).json({ success: true, cart, message: "Cart fetched successfully" });
});

// get all cart product 

const getAllCart = TryCatch(async (req, res, next) => {
  const cart = await Cart.find().populate("items.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }
  res.status(200).json({ success: true, cart, message: "Cart fetched successfully" });
});

const updateCart = TryCatch(async (req, res, next) => {
  const { productId, quantity, userId } = req.body;
console.log(productId);
  if (!productId || !quantity || !userId) {
    return res.status(400).json({ success: false, message: 'Product ID, quantity, and user ID are required.' });
  }

  // Find the cart for the user
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  // Find the item in the cart
  // const itemIndex = cart.items.findIndex(item =>console.log(String(item.productId)));

  const itemIndex = cart.items.findIndex(item => String(item.productId) === String(productId));
// console.log('itemIndex', itemIndex);
  // Check if the item exists in the cart
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Product not found in cart.' });
  }

  // Update the quantity of the item
  cart.items[itemIndex].quantity = quantity;

  // Save the cart
  await cart.save();

  res.status(200).json({ success: true, message: 'Product quantity updated successfully.', cart });
});


// export
module.exports = {
  addToCart,
  getCart,
  getAllCart, 
  updateCart,
  getAllCartByUser
};
