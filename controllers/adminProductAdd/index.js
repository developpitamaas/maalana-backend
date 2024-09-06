const axios = require('axios');
const nodemailer = require('nodemailer');
const Product = require('../../model/adminProductAdd/index');
const BestSellers = require('../../model/adminProductAdd/bestseller')
const Orders = require('../../model/adminProductAdd/orders')
const Users = require('../../model/User/users')


// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: 'sachingautam6239@gmail.com', // Your email
    pass: 'nxajuvwkblihqind'  // Your email password or application-specific password
  }
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

// create orders

const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const newOrder = new Orders(orderData);
    await newOrder.save();

    const userId = orderData.user;
    await axios.delete(`https://maalana-backend.onrender.com/api/delete-cart/${userId}`);

    res.status(200).json({ message: 'Order added successfully and cart cleared', order: newOrder, success: true });

  } catch (error) {
    console.error(error);
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
          <h2 style="margin-top: 0;">Order Summary - Page ${i}</h2>
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
      from: 'Maalana Support Team <sachingautam6239@gmail.com>',
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
  updateOrderStatus
};