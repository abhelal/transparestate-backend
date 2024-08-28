const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const dashboardController = require("../../controllers/dashboardController");
const { allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/dashboard'

router.get("/", allowAccess([USER_ROLES.MAINTAINER, USER_ROLES.JANITOR]), catchErrors(dashboardController.getMaintainerDashboardData));
router.get("/client", allowAccess([USER_ROLES.CLIENT]), catchErrors(dashboardController.getClientDashboardData));
router.get("/tenant", allowAccess([USER_ROLES.TENANT]), catchErrors(dashboardController.getTenantDashboardData));

module.exports = router;
