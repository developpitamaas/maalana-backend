const express = require("express");
const Address = express.Router();
const BillingData = require("../controllers/order/billingaddress");
const ShipedData = require("../controllers/order/shipedaddress");
const auth = require("../middleware/Auth");

// create billing address
Address.route("/create-billing-address").post(BillingData.CreateBillingAddress)
// create shiped address
Address.route("/create-shiped-address").post(ShipedData.CreateShipedAddress)

// get my billing address
Address.route("/get-my-billing-address").get(auth.IsAuthenticateUser ,BillingData.GetMyBillingAddress)
// get my shiped address
Address.route("/get-my-shiped-address/:id").get(ShipedData.GetMyShipedAddress)

// update billing address
Address.route("/update-billing-address/:id").put(BillingData.UpdateBillingAddress)
// update shiped address
Address.route("/update-shiped-address/:id").put(ShipedData.UpdateShipedAddress)

// delete billing address
Address.route("/delete-billing-address/:id").delete(auth.IsAuthenticateUser ,BillingData.DeleteBillingAddress)
// delete shiped address
Address.route("/delete-shiped-address/:id").delete(ShipedData.DeleteShipedAddress)

// get billing address by id
Address.route("/get-billing-address-by-id/:id").get(auth.IsAuthenticateUser ,BillingData.GetBillingAddressById)
// get shiped address by id
Address.route("/get-shiped-address-by-id/:id").get(auth.IsAuthenticateUser ,ShipedData.GetShipedAddressById)

// exports
module.exports = Address
