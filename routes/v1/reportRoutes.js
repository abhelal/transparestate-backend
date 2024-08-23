const express = require("express");
const router = express();

const reportController = require("../../controllers/reportController");

// :: Prefix Path ---  '/api/v1/reports'

router.get("/properties", reportController.getProperties);
router.get("/maintenance", reportController.getMaintenance);

module.exports = router;
