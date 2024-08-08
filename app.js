const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');

const User = require("./routes/user");
const Product = require("./routes/product");
const Category = require("./routes/category");
const Address = require("./routes/address");
const Order = require("./routes/order");
const Admin = require("./routes/admin");
const Coupan = require("./routes/Coupan");
const Wishlist = require("./routes/Wishlist");
const Message = require("./routes/usermessage");
const Subscribe = require("./routes/subscribe");
const Cart = require("./routes/cart");
const SecondOrder = require("./routes/SecondOrder");
const cookieParser = require("cookie-parser");
const Banner = require("./routes/offer");
const AdminLogin = require("./routes/adminRoutes");
const ProductAdd = require("./routes/productRoutes");
const Statistics = require("./routes/statistics");
const Categories = require("./model/Product/Categories");

// define app using express
const app = express();
app.use(bodyParser.json());

// middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// use routes
app.use(
  "/api",
  User,
  Product,
  Category,
  Address,
  Order,
  Admin,
  Wishlist,
  Coupan,
  Message,
  Subscribe,
  Cart,
  SecondOrder,
  Banner,
  AdminLogin,
  ProductAdd,
  Statistics,
  Categories
);

// default route
app.get("/", (req, res) => {
  res.send("Hello World!, Server is running");
});
module.exports = app;
