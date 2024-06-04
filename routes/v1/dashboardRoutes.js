const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const dashboardController = require("../../controllers/dashboardController");

// :: Prefix Path ---  '/api/v1/dashboard'

router.get("/client", catchErrors(dashboardController.getClientDashboardData));

module.exports = router;
