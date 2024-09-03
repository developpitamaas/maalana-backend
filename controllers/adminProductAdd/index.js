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
        data:products,
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
        data:orders,
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
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Determine the email content based on the delivery status
      let emailSubject, emailText, emailHtml;
  
      switch (req.body.deliveryStatus) {
        case 'Delivered':
          emailSubject = 'Order Delivered';
          emailText = `Dear customer, your order with order number ${order.orderNumber} has been successfully delivered. Thank you for shopping with us!`;
          emailHtml = `
            <p>Dear customer,</p>
            <p>Your order with order number <strong>${order.orderNumber}</strong> has been successfully delivered.</p>
            <p>Thank you for shopping with us!</p>
            <p>Order Details:</p>
            <ul>
              ${order.cartItems.map(item => `<li>${item.product}: ${item.quantity} x $${item.price}</li>`).join('')}
            </ul>
            <p>Total: $${order.orderSummary.total}</p>
          `;
          break;
        case 'Shipped':
          emailSubject = 'Order Shipped';
          emailText = `Dear customer, your order with order number ${order.orderNumber} has been shipped. You can expect to receive it soon.`;
          emailHtml = `
            <p>Dear customer,</p>
            <p>Your order with order number <strong>${order.orderNumber}</strong> has been shipped.</p>
            <p>You can expect to receive it soon.</p>
            <p>Order Details:</p>
            <ul>
              ${order.cartItems.map(item => `<li>${item.product}: ${item.quantity} x $${item.price}</li>`).join('')}
            </ul>
            <p>Total: $${order.orderSummary.total}</p>
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
      }
  
      res.status(200).json({ message: 'Order status updated successfully', order, success: true });
  
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  
  // Function to send order update email
  const sendOrderUpdateEmail = async (userEmail, subject, text, html) => {
    try {
      // Set up nodemailer transport
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // You can use another email service
        auth: {
          user: process.env.EMAIL_USER, // Your email user
          pass: process.env.EMAIL_PASSWORD, // Your email password
        },
      });
  
      // Construct the email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
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
  
    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Template</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .email-container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 5px;
                  overflow: hidden;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .email-header {
                  background-color: #4CAF50;
                  color: #ffffff;
                  padding: 20px;
                  text-align: center;
              }
              .email-header img {
                  max-width: 150px;
              }
              .email-body {
                  padding: 20px;
              }
              .email-footer {
                  background-color: #f9f9f9;
                  color: #666;
                  text-align: center;
                  padding: 10px;
                  font-size: 12px;
              }
              .btn {
                  display: inline-block;
                  background-color: #4CAF50;
                  color: #ffffff;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 3px;
                  margin-top: 20px;
              }
              .social-links {
                  margin-top: 10px;
              }
              .social-links a {
                  color: #4CAF50;
                  text-decoration: none;
                  margin: 0 5px;
              }
              @media only screen and (max-width: 600px) {
                  .email-container {
                      width: 100%;
                      margin: 0;
                      border-radius: 0;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">
                  <img src="/placeholder.svg?height=50&width=150" alt="Company Logo">
              </div>
              <div class="email-body">
                  <h2>Hello ${order.userName || 'Customer'},</h2>
                  <p>Thank you for your recent purchase. We're excited to let you know that your order has been successfully processed and is on its way to you.</p>
                  <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                  <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Total Amount:</strong> ₹${order.orderSummary.total}</p>
                  <p><strong>Address:</strong></p>
                  <p>${order.address.address}, ${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.pincode}</p>
                  <a href="#" class="btn">Track Your Order</a>
              </div>
              <div class="email-footer">
                  <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                  <div class="social-links">
                      <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
                  </div>
                  <p>If you have any questions, please contact us at vaibhavrathorema@gmail.com</p>
              </div>
          </div>
      </body>
      </html>
      `;
  
    try {
      // Send email
      const emailOptions = {
        from: 'Your Maalana <vaibhavrathorema@gmail.com>',
        to: email,
        subject: 'Order Confirmation',
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