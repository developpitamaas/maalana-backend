const express = require("express");
const router = express.Router();
const { getShippingAddresses, addShippingAddress, updateShippingAddress, deleteShippingAddress } = require("../controllers/shippingController");

router.get("/:userId", getShippingAddresses);
router.post("/:userId", addShippingAddress);
router.put("/:userId/:addressId", updateShippingAddress);
router.delete("/:userId/:addressId", deleteShippingAddress);

module.exports = router;
