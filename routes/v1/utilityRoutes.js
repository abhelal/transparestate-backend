const express = require("express");
const utilityController = require("../../controllers/utilityController");
const router = express();

// :: Prefix Path ---  '/api/v1/utility'

router.get("/weather", utilityController.getWeather);

module.exports = router;
