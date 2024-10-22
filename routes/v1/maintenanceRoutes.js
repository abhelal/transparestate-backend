const express = require("express");
const router = express();
const maintenanceController = require("../../controllers/maintenanceController");
const { catchErrors } = require("../../handlers/errorHandlers");
const { permissionCheck } = require("../../middleware/authMiddleware");
const { USER_PERMISSIONS } = require("../../constants");

// :: Prefix Path ---  '/api/v1/maintenance'

router.get("/list", catchErrors(maintenanceController.getMaintenances));
router.get("/:maintenanceId", catchErrors(maintenanceController.getMaintenance));
router.post("/create", catchErrors(maintenanceController.createMaintenance));
router.put("/:maintenanceId/update", catchErrors(maintenanceController.updateMaintenance));

module.exports = router;
