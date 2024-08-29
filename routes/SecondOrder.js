const express = require("express");
const SecondOrder = express.Router();
const Data = require("../controllers/order/secondOrder");
const Auth = require("../middleware/Auth");

SecondOrder.route("/create-second-order").post(Data.CreateSecondOrder)
SecondOrder.route("/get-my-second-order").get(Data.GetMySecondOrder)
SecondOrder.route("/get-second-order-by-id/:id").get(Data.GetSecondOrderById)
SecondOrder.route("/get-all-second-order").get(Data.GetAllsecondOrders)
SecondOrder.route("/update-second-order-by-id/:id").put(Data.UpdateSecondOrder)

// module.exports
module.exports = SecondOrder