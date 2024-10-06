const express = require("express");
const router = express();
const maintenanceController = require("../../controllers/maintenanceControler");
const { catchErrors } = require("../../handlers/errorHandlers");
const { permissionCheck } = require("../../middleware/authMiddleware");
const { USER_PERMISSIONS } = require("../../constants");

// :: Prefix Path ---  '/api/v1/maintenance'
router.get("/list", permissionCheck(USER_PERMISSIONS.READ_MAINTENANCE), catchErrors(maintenanceController.getMaintenances));
router.post("/create", permissionCheck(USER_PERMISSIONS.UPDATE_MAINTENANCE), catchErrors(maintenanceController.createMaintenance));
router.put(
  "/:maintenanceId/update",
  permissionCheck(USER_PERMISSIONS.UPDATE_MAINTENANCE),
  catchErrors(maintenanceController.updateMaintenance)
);

module.exports = router;
