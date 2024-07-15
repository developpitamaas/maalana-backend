const SecondorderSchema = require("../../model/order/orders");
const TryCatch = require("../../middleware/Trycatch");
const Mail = require("../../utils/sendmail");
const Cart = require("../../model/order/cart");
const Product = require("../../model/Product/product");
const ApiFeatures = require("../../utils/apifeature");


const CreateSecondOrder = TryCatch(async (req, res, next) => {
  const userId = req.user.id;
  const { CartId, paymentMethod, shippingAddress } = req.body;

  // Create the second order
  const secondorder = await SecondorderSchema.create({ ...req.body, userId });

  // Extract order items from the cart
  const cart = await Cart.findById(CartId).populate("orderItems.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  // Clear the complete cart
  await Cart.findByIdAndUpdate(CartId, { activecart: "false" });

  // Send mail
  const userEmail = req.user.email;
  const orderDetails = generateOrderDetails(cart);
  const orderSummary = generateOrderSummary(cart, shippingAddress, paymentMethod);

  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
          }
          h1 {
            text-align: center;
            color: #333;
          }
          .order-details {
            margin-bottom: 20px;
          }
          .order-item {
            border-bottom: 1px solid #ddd;
            padding: 10px 0;
          }
          .order-item img {
            max-width: 100px;
            vertical-align: middle;
            margin-right: 10px;
          }
          .order-item-info {
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Order Confirmation</h1>
          <p>Hi there,</p>
          <p>Your order has been successfully placed. Below are the details:</p>
          <div class="order-details">
            ${orderDetails}
          </div>
          <div class="order-summary">
            ${orderSummary}
          </div>
          <p>Thank you for shopping with us!</p>
        </div>
      </body>
    </html>
  `;

  Mail(
    userEmail,
    "Order Placed Successfully",
    htmlContent,
    true
  );

  // Update product quantities and check for out of stock
  const updatedProducts = [];
  const lowQuantityProducts = [];
  const outOfStockProducts = [];
  for (const item of cart.orderItems) {
    const product = item.productId;
    const updatedQuantity = product.quantity - item.quantity;
    const isOutOfStock = updatedQuantity <= 0 ? "true" : "false";

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { quantity: updatedQuantity, IsOutOfStock: isOutOfStock },
      { new: true }
    );
    if (updatedQuantity < 20 && updatedQuantity > 1) {
      lowQuantityProducts.push(updatedProduct);
    }

    if (updatedQuantity <= 0) {

      outOfStockProducts.push(updatedProduct);
    }
    updatedProducts.push(updatedProduct);
  }

  // Send mail for low quantity products
  if (lowQuantityProducts.length > 0) {
    let lowQuantityMessage = "<p>Some products are running low on quantity. Please check your inventory:</p><ul>";
    lowQuantityProducts.forEach(product => {
      lowQuantityMessage += `<li>${product.name} : <br/> quantity : ${product.quantity} </li> <img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
    });
    lowQuantityMessage += "</ul>";

    Mail(
      "vaibhavrathorema@gmail.com",
      "Low Product Quantity Alert",
      lowQuantityMessage,
      true 
    );
  }

  // Send mail for out of stock products
  if (outOfStockProducts.length > 0) {
    let outOfStockMessage = "<p>Some products are out of stock. Please update your inventory:</p><ul>";
    outOfStockProducts.forEach(product => {
      outOfStockMessage += `<li>${product.name}</li><img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
    });
    outOfStockMessage += "</ul>";

    Mail(
      "vaibhavrathorema@gmail.com",
      "Out of Stock Products Alert",
      outOfStockMessage,
      true 
    );
  }

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    secondorder,
    updatedProducts,
  });
});

function generateOrderDetails(cart) {
  let detailsHtml = '<div class="order-details">';
  cart.orderItems.forEach(item => {
    detailsHtml += `
      <div class="order-item">
        <img loading="lazy" src="${item.productId.thumbnail}" alt="${item.productId.name}">
        <div class="order-item-info">
          <p><strong>${item.productId.name}</strong></p>
          <p>Quantity: ${item.quantity}</p>
          <p>Total Price: ${item.totalPrice}</p>
        </div>
      </div>
    `;
  });
  detailsHtml += '</div>';
  return detailsHtml;
}

function generateOrderSummary(cart, shippingAddress, paymentMethod) {
  let summaryHtml = '<div class="order-summary">';
  summaryHtml += `
    <h2>Order Summary</h2>
    <p>Payment Method: ${paymentMethod}</p>
    <p>Shipping Address:</p>
    <p>${shippingAddress.firstname} ${shippingAddress.lastname}</p>
    <p>${shippingAddress.address}</p>
    <p>${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country} - ${shippingAddress.pincode}</p>
  `;
  summaryHtml += '</div>';
  return summaryHtml;
}




// get my second order
const GetMySecondOrder = TryCatch(async (req, res, next) => {
  const data = await SecondorderSchema.find({ userId: req.user.id })
    // .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  const secondorders = data.reverse();

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    total: secondorders.length,
    secondorders,
  });
});

module.exports = GetMySecondOrder;

// get second order by id
const GetSecondOrderById = TryCatch(async (req, res, next) => {
  const secondorder = await SecondorderSchema.findById(req.params.id)
    .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  res.status(200).json({
    success: true,
    message: "Order fetched successfully vaibhaknknknknk",
    secondorder,
  });
});

// get all orders
const GetAllsecondOrders = TryCatch(async (req, res, next) => {
  const status = req.query.status || "Pending";
  const resultperpage = req.query.resultperpage || 10;
  // Initialize ApiFeatures with the Order model query and the query string from the request
  const features = new ApiFeatures(SecondorderSchema.find(), req.query)
    // Apply search functionality if 'name' is provided in the query string
    .search()
    .filterByStatus(status)
    // Apply pagination with default limit of 10 items per page
    .paginate(resultperpage);

  // Execute the query with applied features
  const ALlOrders = await features.query
    // Populate necessary fields
    .populate("CartId")
    .populate({
      path: "CartId",
      populate: {
        path: "orderItems.productId",
        model: "product",
      },
    })
    .populate("shippingAddress")
    .populate("billingAddress")
    .populate("userId");

  const Orders = ALlOrders.reverse();

  // Send response
  res.status(200).json({
    success: true,
    count: Orders.length,
    Orders,
  });
});

// update order
const UpdateSecondOrder = TryCatch(async (req, res, next) => {
  // req.body.UpdateAt = Date.now();
  const secondorder = await SecondorderSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  // UpdateAt
  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    secondorder,
  });
});

// exports
module.exports = {
  CreateSecondOrder,
  GetMySecondOrder,
  GetSecondOrderById,
  GetAllsecondOrders,
  UpdateSecondOrder,
};


// const SecondorderSchema = require("../../model/order/orders");
// const TryCatch = require("../../middleware/Trycatch");
// const Mail = require("../../utils/sendmail");
// const Cart = require("../../model/order/cart");
// const Product = require("../../model/Product/product");
// const ApiFeatures = require("../../utils/apifeature");
// const NodeCache = require("node-cache");
// const cache = new NodeCache();
// const { updateProductQuantity } = require("../../model/Product/product");
// const { getCartById, updateCart } = require("../../model/order/cart");


// const CreateSecondOrder = TryCatch(async (req, res, next) => {
//   const userId = req.user.id;
//   const { CartId, paymentMethod, shippingAddress } = req.body;

//   const secondorder = await SecondorderSchema.create({ ...req.body, userId });

//   const cart = await getCartById(CartId);
//   if (!cart) {
//     return res.status(404).json({ success: false, message: "Cart not found" });
//   }

//   await updateCart(CartId, { activecart: "false" });

//   const userEmail = req.user.email;
//   const orderDetails = generateOrderDetails(cart);
//   const orderSummary = generateOrderSummary(cart, shippingAddress, paymentMethod);

//   const htmlContent = `
//     <html>
//       <head>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             margin: 0;
//             padding: 0;
//           }
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             padding: 20px;
//             border: 1px solid #ddd;
//             border-radius: 10px;
//           }
//           h1 {
//             text-align: center;
//             color: #333;
//           }
//           .order-details {
//             margin-bottom: 20px;
//           }
//           .order-item {
//             border-bottom: 1px solid #ddd;
//             padding: 10px 0;
//           }
//           .order-item img {
//             max-width: 100px;
//             vertical-align: middle;
//             margin-right: 10px;
//           }
//           .order-item-info {
//             display: inline-block;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <h1>Order Confirmation</h1>
//           <p>Hi there,</p>
//           <p>Your order has been successfully placed. Below are the details:</p>
//           <div class="order-details">
//             ${orderDetails}
//           </div>
//           <div class="order-summary">
//             ${orderSummary}
//           </div>
//           <p>Thank you for shopping with us!</p>
//         </div>
//       </body>
//     </html>
//   `;

//   Mail(
//     userEmail,
//     "Order Placed Successfully",
//     htmlContent,
//     true
//   );

//   const updatedProducts = [];
//   const lowQuantityProducts = [];
//   const outOfStockProducts = [];
//   for (const item of cart.orderItems) {
//     const updatedProduct = await updateProductQuantity(item.productId._id, item.quantity);
//     if (updatedProduct.quantity < 20 && updatedProduct.quantity > 1) {
//       lowQuantityProducts.push(updatedProduct);
//     }
//     if (updatedProduct.quantity <= 0) {
//       outOfStockProducts.push(updatedProduct);
//     }
//     updatedProducts.push(updatedProduct);
//   }

//   if (lowQuantityProducts.length > 0) {
//     let lowQuantityMessage = "<p>Some products are running low on quantity. Please check your inventory:</p><ul>";
//     lowQuantityProducts.forEach(product => {
//       lowQuantityMessage += `<li>${product.name} : <br/> quantity : ${product.quantity} </li> <img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     lowQuantityMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Low Product Quantity Alert",
//       lowQuantityMessage,
//       true 
//     );
//   }

//   if (outOfStockProducts.length > 0) {
//     let outOfStockMessage = "<p>Some products are out of stock. Please update your inventory:</p><ul>";
//     outOfStockProducts.forEach(product => {
//       outOfStockMessage += `<li>${product.name}</li><img loading="lazy" src="${product.thumbnail}" alt="${product.name}" style="max-width: 100px;">`;
//     });
//     outOfStockMessage += "</ul>";

//     Mail(
//       "vaibhavrathorema@gmail.com",
//       "Out of Stock Products Alert",
//       outOfStockMessage,
//       true 
//     );
//   }

//   res.status(201).json({
//     success: true,
//     message: "Order created successfully",
//     secondorder,
//     updatedProducts,
//   });

//   cache.set(`order_${secondorder._id}`, secondorder);
// });

// const GetMySecondOrder = TryCatch(async (req, res, next) => {
//   const cacheKey = `my_orders_${req.user.id}`;
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.status(200).json({
//       success: true,
//       message: "Orders fetched successfully",
//       total: cachedData.length,
//       secondorders: cachedData,
//     });
//   }

//   const data = await SecondorderSchema.find({ userId: req.user.id })
//     .populate({
//       path: "CartId",
//       populate: {
//         path: "orderItems.productId",
//         model: "product",
//       },
//     })
//     .populate("shippingAddress")
//     .populate("billingAddress")
//     .populate("userId");

//   const secondorders = data.reverse();

//   res.status(200).json({
//     success: true,
//     message: "Orders fetched successfully",
//     total: secondorders.length,
//     secondorders,
//   });

//   cache.set(cacheKey, secondorders);
// });

// const GetSecondOrderById = TryCatch(async (req, res, next) => {
//   const cacheKey = `order_${req.params.id}`;
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.status(200).json({
//       success: true,
//       message: "Order fetched successfully",
//       secondorder: cachedData,
//     });
//   }

//   const secondorder = await SecondorderSchema.findById(req.params.id)
//     .populate("CartId")
//     .populate({
//       path: "CartId",
//       populate: {
//         path: "orderItems.productId",
//         model: "product",
//       },
//     })
//     .populate("shippingAddress")
//     .populate("billingAddress")
//     .populate("userId");

//   res.status(200).json({
//     success: true,
//     message: "Order fetched successfully",
//     secondorder,
//   });

//   cache.set(cacheKey, secondorder);
// });

// const GetAllsecondOrders = TryCatch(async (req, res, next) => {
//   const cacheKey = `all_orders_${req.query.status || "Pending"}_${req.query.resultperpage || 10}`;
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.status(200).json({
//       success: true,
//       count: cachedData.length,
//       Orders: cachedData,
//     });
//   }

//   const status = req.query.status || "Pending";
//   const resultperpage = req.query.resultperpage || 10;
//   const features = new ApiFeatures(SecondorderSchema.find(), req.query)
//     .search()
//     .filterByStatus(status)
//     .paginate(resultperpage);

//   const ALlOrders = await features.query
//     .populate("CartId")
//     .populate({
//       path: "CartId",
//       populate: {
//         path: "orderItems.productId",
//         model: "product",
//       },
//     })
//     .populate("shippingAddress")
//     .populate("billingAddress")
//     .populate("userId");

//   const Orders = ALlOrders.reverse();

//   res.status(200).json({
//     success: true,
//     count: Orders.length,
//     Orders,
//   });

//   cache.set(cacheKey, Orders);
// });

// const UpdateSecondOrder = TryCatch(async (req, res, next) => {
//   const secondorder = await SecondorderSchema.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     {
//       new: true,
//       runValidators: true,
//       useFindAndModify: false,
//     }
//   );

//   res.status(200).json({
//     success: true,
//     message: "Order updated successfully",
//     secondorder,
//   });

//   cache.set(`order_${req.params.id}`, secondorder);
// });

// module.exports = {
//   CreateSecondOrder,
//   GetMySecondOrder,
//   GetSecondOrderById,
//   GetAllsecondOrders,
//   UpdateSecondOrder,
// };
