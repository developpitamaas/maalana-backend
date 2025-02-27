const express = require("express");
const { submitBaatCheet } = require("../controllers/baatCheetController");

const router = express.Router();

router.post("/submit", submitBaatCheet);

module.exports = router;
