const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const dashboardController = require("../../controllers/dashboardController");
const { allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/dashboard'

router.get("/", allowAccess([USER_ROLES.MAINTAINER, USER_ROLES.JANITOR]), catchErrors(dashboardController.getDashboardData));
router.get("/client", allowAccess([USER_ROLES.CLIENT]), catchErrors(dashboardController.getClientDashboardData));
router.get("/tenant", allowAccess([USER_ROLES.TENANT]), catchErrors(dashboardController.getTenantDashboardData));
router.get("/super-admin", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(dashboardController.getSuperAdminDashboardData));

module.exports = router;
