const express = require("express");
const { submitHumkoJoinKarlo } = require("../controllers/humkoJoinKarloController");

const router = express.Router();

router.post("/submit", submitHumkoJoinKarlo);

module.exports = router;
