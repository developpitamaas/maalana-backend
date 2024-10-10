const axios = require('axios');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const Product = require('../../model/adminProductAdd/index');
const BestSellers = require('../../model/adminProductAdd/bestseller')
const Orders = require('../../model/adminProductAdd/orders')
const Users = require('../../model/User/users')
const Coupon = require('../../model/adminProductAdd/Coupon')

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: 'sachingautam6239@gmail.com', // Your email
    pass: 'nxajuvwkblihqind'  // Your email password or application-specific password
  }
});

// Initialize Razorpay with correct credentials
const razorpayInstance = new Razorpay({
  key_id: 'rzp_test_mQ80OF7C7GfnTU',
  key_secret: 'ETilgefIc6SO5PM1SRFpFHfl',
});

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

const addBestSellerProduct = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = new BestSellers(productData);
    await newProduct.save();

    res.status(200).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getBestSellerProduct = async (req, res) => {
  try {
    const products = await BestSellers.find();
    res.status(200).json({
      success: true,
      data: products,
      message: 'Products fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// get the order all list 

const getOrders = async (req, res) => {
  try {
    const orders = await Orders.find();
    res.status(200).json({
      success: true,
      data: orders,
      message: 'Orders fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// get order by user id
const getOrderByUserId = async (req, res) => {
  try {
    const orders = await Orders.find({ user: req.params.userId });
    console.log('orders', orders);
    const formattedOrders = orders.map(order => ({
      orderNumber: order.orderNumber,
      OrderDate: order.createdAt,
      totalPrice: order.orderSummary.total,
      deliveryStatus: order.deliveryStatus,
      cartItems: order.cartItems.map(item => ({
        productImage: item.image,
      })),
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
      message: 'Orders fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// get order-details by order number

const getOrderDetailsByOrderNumber = async (req, res) => {
  try {
    const orderDetails = await Orders.findOne({ orderNumber: req.params.orderNumber });
    console.log('orderDetails', orderDetails);
    res.status(200).json({
      success: true,
      data: orderDetails,
      message: 'Order details fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// create orders

const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    console.log('orderData', orderData);
    const newOrder = new Orders(orderData);
    await newOrder.save();
    console.log('newOrder', newOrder);
    const userId = orderData.user;
    await axios.delete(`https://maalana-backend.onrender.com/api/delete-cart/${userId}`);

    res.status(200).json({ message: 'Order added successfully and cart cleared', order: newOrder, success: true });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const createOrderOnline = async (req, res) => {
  try {
    const orderData = req.body;

    // Step 1: Create a Razorpay Order using the Razorpay SDK
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: orderData.orderSummary.total * 100, // Amount in the smallest currency unit (e.g., paisa for INR)
      currency: 'INR',
      receipt: `receipt_${orderData.user}`,

    });

    // Step 2: Store the Razorpay order ID in the order data
    orderData.razorpayOrderId = razorpayOrder.id;

    // Step 3: Create the order in your database
    const newOrder = new Orders(orderData);
    await newOrder.save();

    // Step 4: Clear the user's cart after creating the order
    const userId = orderData.user;
    await axios.delete(`https://maalana-backend.onrender.com/api/delete-cart/${userId}`);

    // Step 5: Send response back to client with Razorpay order ID and necessary fields
    res.status(200).json({
      message: 'Order created successfully and cart cleared',
      order: newOrder,
      razorpayOrderId: razorpayOrder.id, // Send only razorpayOrderId
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      success: true,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


// // Function to verify the Razorpay payment signature (this should be called after payment is successful)
// const verifyRazorpayPayment = async (req, res) => {
//   try {
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//     // Generate the expected signature
//     const generated_signature = crypto
//       .createHmac('sha256', 'ETilgefIc6SO5PM1SRFpFHfl')
//       .update(razorpay_order_id + '|' + razorpay_payment_id)
//       .digest('hex');
//     console.log(generated_signature, razorpay_signature);
//     // Step 6: Verify the signature
//     if (generated_signature === razorpay_signature) {
//       // Signature is valid, update the order status to 'Paid'
//       await Orders.updateOne(
//         { razorpayOrderId: razorpay_order_id },
//         { status: 'Paid' }
//       );

//       res.status(200).json({ message: 'Payment verified successfully', success: true });
//     } else {
//       // Invalid signature
//       res.status(400).json({ message: 'Invalid signature', success: false });
//     }
//   } catch (error) {
//     console.error('Error verifying Razorpay payment:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };


// // Function to handle Razorpay payment verification without signature check
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    console.log(razorpay_payment_id, razorpay_order_id);

    if (!razorpay_payment_id || !razorpay_order_id) {
      return res.status(400).json({ message: 'Missing required payment fields', success: false });
    }

    // Retrieve the payment details from Razorpay to ensure it exists
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

    if (payment) {
      if (payment.status === 'authorized') {
        // Payment is authorized, capture it
        const captureResponse = await razorpayInstance.payments.capture(
          razorpay_payment_id,
          payment.amount, // Amount to be captured in the smallest unit (e.g., paisa for INR)
          payment.currency // Currency of the payment
        );

        if (captureResponse.status === 'captured') {
          // Payment successfully captured; update order status to 'Paid'
          await Orders.updateOne({ razorpayOrderId: razorpay_order_id }, { status: 'Paid' });

          return res.status(200).json({ message: 'Payment captured and verified successfully', success: true });
        } else {
          // Payment capture failed
          return res.status(400).json({ message: 'Payment capture failed', success: false });
        }
      } else if (payment.status === 'captured') {
        // Payment is already captured; update order status to 'Paid'
        await Orders.updateOne({ razorpayOrderId: razorpay_order_id }, { status: 'Paid' });

        return res.status(200).json({ message: 'Payment already captured and verified successfully', success: true });
      } else {
        // Payment is not authorized or captured; handle other statuses (failed, refunded, etc.)
        return res.status(400).json({ message: `Payment status is ${payment.status}. Cannot proceed.`, success: false });
      }
    } else {
      // Payment not found
      return res.status(400).json({ message: 'Payment not found in Razorpay', success: false });
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};



const updateOrderStatus = async (req, res) => {
  try {
    // Update the order status
    const order = await Orders.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    console.log(order);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Determine the email content based on the delivery status
    let emailSubject, emailText, emailHtml;

    switch (req.body.deliveryStatus) {
      case 'Delivered':
        emailSubject = `🎉 Your Order Has Arrived! 🚚`;
        emailText = `Dear customer, your order with order number ${order.orderNumber} has been delivered. We hope you enjoy your purchase!`;
        emailHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Delivered</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                  <tr>
                      <td style="padding: 20px; text-align: center; background-color: #B9D514;">
                          <img src="https://res.cloudinary.com/dtivafy25/image/upload/v1725260985/logo-1_rqojr8.png" alt="Maalana" style="max-width: 200px; height: auto;">
                      </td>
                  </tr>
                  <tr>
                      <td style="padding: 40px 20px; text-align: center;">
                          <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Order Delivered</h1>
                          <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear customer,</p>
                          <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Great news! Your order (${order.orderNumber}) has been delivered. We hope you are delighted with your purchase!</p>
                          
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; margin-bottom: 20px;">
                              <tr>
                                  <td style="padding: 20px;">
                                      <h2 style="color: #333333; font-size: 20px; margin-bottom: 15px; text-align: left;">Order Summary</h2>
                                      <table class="order-table" style="width: 100%; border-collapse: separate; border-spacing: 0;">
                                          <thead>
                                              <tr>
                                                  <th style="padding: 12px 20px; text-align: left; background-color: #f6f9fc; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #B9D514;">Item</th>
                                                  <th style="padding: 12px 20px; text-align: left; background-color: #f6f9fc; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #B9D514;">Quantity</th>
                                                  <th style="padding: 12px 20px; text-align: left; background-color: #f6f9fc; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #B9D514;">Price</th>
                                                  <th style="padding: 12px 20px; text-align: left; background-color: #f6f9fc; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #B9D514;">Total</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                              ${order.cartItems.map((item, index) => `
                                              <tr style='background-color: ${index % 2 === 0 ? '#ffffff' : '#f6f9fc'};'>
                                                  <td style="padding: 12px 20px; text-align: left;">${item.name}</td>
                                                  <td style="padding: 12px 20px; text-align: left;">${item.quantity}</td>
                                                  <td style="padding: 12px 20px; text-align: left;">₹${item.price}</td>
                                                  <td style="padding: 12px 20px; text-align: left;">₹${item.price * item.quantity}</td>
                                              </tr>
                                              `).join('')}
                                              <tr style="font-weight: bold; background-color: #e9f0f9;">
                                                  <td colspan="3" style="padding: 12px 20px; text-align: left; border-top: 2px solid #B9D514;">Total</td>
                                                  <td style="padding: 12px 20px; text-align: left; border-top: 2px solid #B9D514;">₹${order.orderSummary.total}</td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                              <tr>
                                  <td>
                                      <h2 style="color: #333333; font-size: 20px; margin-bottom: 15px;">Shipping Address</h2>
                                      <p style="color: #666666; font-size: 14px; line-height: 1.5;">
                                          ${order.address.address}, ${order.address.city}, ${order.address.state}, ${order.address.country} - ${order.address.pincode}
                                      </p>
                                  </td>
                              </tr>
                          </table>
                          
                          <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for shopping with us! If you have any questions, feel free to contact our support team.</p>
                      </td>
                  </tr>
                  <tr>
                      <td style="padding: 20px; text-align: center; background-color: #B9D514; color: #ffffff;">
                          <p style="margin: 0; font-size: 14px;">© ${new Date().getFullYear()} Maalana. All rights reserved.</p>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
        `;
        break;
      case 'Shipped':
        emailSubject = `Your Order's On the Way! 🚚 Get Ready for Delivery`;
        emailText = `Dear customer, your order with order number ${order.orderNumber} has been shipped. You can expect to receive it soon.`;
        emailHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Shipped</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                  <tr>
                      <td style="padding: 20px; text-align: center; background-color: #B9D514;">
                          <img src="https://res.cloudinary.com/dtivafy25/image/upload/v1725260985/logo-1_rqojr8.png" alt="Maalana" style="max-width: 200px; height: auto;">
                      </td>
                  </tr>
                  <tr>
                      <td style="padding: 40px 20px; text-align: center;">
                          <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Order Shipped</h1>
                          <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear customer,</p>
                          <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Great news! Your order (${order.orderNumber}) has been shipped and is on its way to you.</p>
                          
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; margin-bottom: 20px;">
                              <tr>
                                  <td style="padding: 20px;">
                                      <h2 style="color: #333333; font-size: 20px; margin-bottom: 15px; text-align: left;">Order Summary</h2>
                                      <table class="order-table" style="width: 100%; border-collapse: separate; border-spacing: 0;">
                                          <thead>
                                              <tr>
                                                  <th style="padding: 12px 20px; text-align: left; background-color: #f6f9fc; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #B9D514;">Item</th>
                                                  <th style="padding: 12px 20px; text-align: left; background-color: #f6f9fc; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #B9D514;">Quantity</th>
                                                  <th style="padding: 12px 20px; text-align: left; background-color: #f6f9fc; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #B9D514;">Price</th>
                                                  <th style="padding: 12px 20px; text-align: left; background-color: #f6f9fc; font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #B9D514;">Total</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                              ${order.cartItems.map((item, index) => `
                                              <tr style='background-color: ${index % 2 === 0 ? '#ffffff' : '#f6f9fc'};'>
                                                  <td style="padding: 12px 20px; text-align: left;">${item.name}</td>
                                                  <td style="padding: 12px 20px; text-align: left;">${item.quantity}</td>
                                                  <td style="padding: 12px 20px; text-align: left;">₹${item.price}</td>
                                                  <td style="padding: 12px 20px; text-align: left;">₹${item.price * item.quantity}</td>
                                              </tr>
                                              `).join('')}
                                              <tr style="font-weight: bold; background-color: #e9f0f9;">
                                                  <td colspan="3" style="padding: 12px 20px; text-align: left; border-top: 2px solid #B9D514;">Total</td>
                                                  <td style="padding: 12px 20px; text-align: left; border-top: 2px solid #B9D514;">₹${order.orderSummary.total}</td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                              <tr>
                                  <td>
                                      <h2 style="color: #333333; font-size: 20px; margin-bottom: 15px;">Shipping Address</h2>
                                      <p style="color: #666666; font-size: 14px; line-height: 1.5;">
                                          ${order.address.address}, ${order.address.city}, ${order.address.state}, ${order.address.country} - ${order.address.pincode}
                                      </p>
                                  </td>
                              </tr>
                          </table>
                          
                          <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We'll send you another email when your order has been delivered.</p>
                          <p style="color: #666666; font-size: 16px; line-height: 1.5;">Thank you for shopping with us!</p>
                      </td>
                  </tr>
                  <tr>
                      <td style="padding: 20px; text-align: center; background-color: #B9D514; color: #ffffff;">
                          <p style="margin: 0; font-size: 14px;">© ${new Date().getFullYear()} Maalana. All rights reserved.</p>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
          `;
        break;
      case 'Pending':
        emailSubject = 'Order Pending';
        emailText = `Dear customer, your order with order number ${order.orderNumber} is still pending. We will notify you once it has been processed.`;
        emailHtml = `
            <p>Dear customer,</p>
            <p>Your order with order number <strong>${order.orderNumber}</strong> is still pending.</p>
            <p>We will notify you once it has been processed.</p>
            <p>Order Details:</p>
            <ul>
              ${order.cartItems.map(item => `<li>${item.product}: ${item.quantity} x $${item.price}</li>`).join('')}
            </ul>
            <p>Total: $${order.orderSummary.total}</p>
          `;
        break;
      default:
        return res.status(400).json({ message: 'Invalid delivery status' });
    }

    // Fetch user details
    const user = await Users.findById(order.user);
    if (user) {
      // Send an email to the user
      await sendOrderUpdateEmail(user.email, emailSubject, emailText, emailHtml);
      res.status(200).json({ message: 'Order status updated successfully', order, success: true });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Function to send order update email
const sendOrderUpdateEmail = async (userEmail, subject, text, html) => {
  try {

    // Construct the email content
    const mailOptions = {
      from: '',
      to: userEmail,
      subject: subject,
      text: text,
      html: html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendEmail = async (req, res) => {
  const { email, order } = req.body;

  // Destructure order data
  const { cartItems, address, orderSummary } = order;

  if (!order || !order.cartItems) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  // Pagination settings
  const itemsPerPage = 5;
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);

  // Function to generate pagination content
  const generatePageContent = (page) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToDisplay = cartItems.slice(start, end);

    return itemsToDisplay.map(item => `
      <div style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
          <div style="flex-grow: 1;">
              <div style="font-weight: 600; margin-bottom: 5px;">${item.name}</div>
              <div style="font-weight: 600; color: #B9D514;">₹${item.price}</div>
              <div>Quantity: ${item.quantity}</div>
          </div>
      </div>
    `).join('');
  };

  // Generate the HTML content for all pages
  let pagesHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    pagesHtml += `
    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
        <!-- Replace the page-specific heading with a single order summary heading -->
        <h2 style="margin-top: 0; text-align: center;">Your Order Summary</h2>
        <p style="margin: 0 0 20px; text-align: center; color: #777;">
            We're thrilled to confirm your order! Here's a detailed summary of your purchase.
        </p>
        ${generatePageContent(i)}
        <div style="text-align: center; margin-top: 20px;">
            ${i > 1 ? `<a href="#page${i - 1}" style="text-decoration: none; color: #B9D514;">Previous</a>` : ''}
            ${i < totalPages ? ` | <a href="#page${i + 1}" style="text-decoration: none; color: #B9D514;">Next</a>` : ''}
        </div>
    </div>
  `;
  }

  // Email HTML template
  const emailHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
  </head>
  <body style="font-family: 'Poppins', sans-serif; background-color: #f4f4f4; color: #333; line-height: 1.6; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #B9D514; color: #ffffff; text-align: center; padding: 20px;">
              <img src="https://res.cloudinary.com/dtivafy25/image/upload/v1725260985/logo-1_rqojr8.png" alt="Company Logo" style="max-width: 150px; margin-bottom: 10px;">
              <h1 style="margin: 0;">Order Confirmed!</h1>
              <p style="margin: 0;">Thank you for your purchase</p>
          </div>
          <div style="padding: 30px;">
              ${pagesHtml}
              <div style="font-size: 24px; font-weight: 700; text-align: right; margin-top: 20px; color: #B9D514;">
                  Total: ₹${orderSummary.total.toFixed(2)}
              </div>
              <div style="background-color: #f0f7e6; border-radius: 8px; padding: 20px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                  <h3 style="color: #B9D514; margin-top: 0;">Shipping Information</h3>
                  <p style="margin: 0;">
                      ${address.address}, ${address.city}, ${address.state}, ${address.country}, ${address.pincode}
                  </p>
              </div>
              <div style="background-color: #f0f7e6; border-radius: 8px; padding: 20px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                Order Number: <span>${order.orderNumber}</span><br>
              </div>
              <a href="#" style="display: inline-block; background-color: #fff; color: #B9D514; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 20px; box-shadow: 0 2px 5px rgba(185, 213, 20, 0.3);">Track Your Order</a>
          </div>
          <div style="background-color: #f4f4f4; text-align: center; padding: 20px; font-size: 14px; color: #777;">
              If you have any questions, please contact our support team at support@example.com
          </div>
      </div>
  </body>
  </html>
`;

  try {
    // Send email
    const emailOptions = {
      from: 'Maalana Foods <sachingautam6239@gmail.com>',
      to: email,
      subject: '🎈 Maalana Order Confirmed! Get Ready for Deliciousness!',
      html: emailHtml
    };

    await transporter.sendMail(emailOptions);

    res.status(200).json({ message: 'Order details sent successfully!' });
  } catch (error) {
    console.error('Error sending order details:', error);
    res.status(500).json({ message: 'Failed to send order details', error });
  }
};

// Function to generate a unique coupon code based on email and timestamp
const generateUniqueCouponCode = (email) => {
  const timestamp = Date.now();  // Current timestamp
  const emailHash = email.split('@')[0];  // Use part of the email before '@'
  const uniqueCode = `MAALANA${emailHash.toUpperCase().slice(0, 5)}${timestamp.toString().slice(-4)}`;
  return uniqueCode;
};

// Coupon code generator and send email
const generateCoupon = async (req, res) => {
  const { email, discount } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if coupon code already exists for this email
    const existingCoupon = await Coupon.findOne({ email });
    if (existingCoupon) {
      return res.status(409).json({ message: 'Coupon code already exists for this email.' });
    }

    // Generate coupon code
    const couponCode = generateUniqueCouponCode(email);


    // Create new coupon
    const newCoupon = new Coupon({
      email,
      discount,
      couponCode,
    });

    // Save coupon to database
    await newCoupon.save();

    // Email options for sending coupon code
    const emailOptions = {
      from: 'Maalana Exclusive Offers  <sachingautam6239@gmail.com>',
      to: email,
      subject: 'Enjoy 10% Off! Here’s Your Special Maalana Coupon Code',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Special Coupon Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #B9D514;">
              <img src="https://res.cloudinary.com/dtivafy25/image/upload/v1725260985/logo-1_rqojr8.png" alt="Maalana Logo" style="max-width: 200px; height: auto;">
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Your Special Coupon Code</h1>
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear Valued Customer,</p>
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We're excited to offer you an exclusive discount on your next purchase!</p>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f6f9fc; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <h2 style="color: #333333; font-size: 18px; margin-bottom: 10px;">Use this coupon code:</h2>
                    <div style="background-color: #ffffff; border: 2px dashed #B9D514; border-radius: 4px; padding: 10px; display: inline-block;">
                      <span style="color: #B9D514; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${couponCode}</span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This coupon code gives you a 10% discount on your entire purchase. Don't miss out on this amazing offer!</p>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://maalana-e-commerce.vercel.app" style="display: inline-block; background-color: #B9D514; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 4px;">Shop Now</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">Terms and conditions apply. This offer cannot be combined with other promotions or discounts.</p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.5;">Thank you for being a loyal customer!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #B9D514; color: #ffffff;">
              <p style="margin: 0; font-size: 14px;">© ${new Date().getFullYear()} Maalana. All rights reserved.</p>
              <p style="margin: 10px 0 0; font-size: 12px;">
                You're receiving this email because you've subscribed to our newsletter or made a purchase from our store.
                <br>
                <a href="#" style="color: #ffffff; text-decoration: underline;">Unsubscribe</a> | <a href="#" style="color: #ffffff; text-decoration: underline;">Update Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    // Send the email
    await transporter.sendMail(emailOptions);

    // Respond with success
    res.status(200).json({ success: true, message: 'Coupon code generated and sent successfully!' });

  } catch (error) {
    console.error('Error generating coupon code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// apply coupon code
const applyCoupon = async (req, res) => {
  const { couponCode } = req.body;

  if (!couponCode) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  try {
    // Find the coupon by code
    const coupon = await Coupon.findOne({ couponCode });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon code not found' });
    }

    // Check if the coupon is expired or already used
    const now = new Date();
    if (coupon.isUsed) {
      return res.status(400).json({ message: 'Coupon code has already been used' });
    }

    if (now > coupon.expiresAt) {
      return res.status(400).json({ message: 'Coupon code has expired' });
    }

    // Mark the coupon as used (optional)
    coupon.isUsed = true;
    await coupon.save();

    // Respond with success and coupon details
    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully',
      coupon: {
        code: coupon.couponCode,
        discount: `${coupon.discount}`,  // Return the discount percentage
      },
    });

  } catch (error) {
    console.error('Error applying coupon code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// remove the 

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByCategory,
  addBestSellerProduct,
  getBestSellerProduct,
  getOrders,
  createOrder,
  sendEmail,
  updateOrderStatus,
  generateCoupon,
  applyCoupon,
  verifyRazorpayPayment,
  createOrderOnline,
  getOrderByUserId,
  getOrderDetailsByOrderNumber
};