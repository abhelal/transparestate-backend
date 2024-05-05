const express = require("express");
const router = express();
const maintenanceController = require("../../controllers/maintenanceControler");
const { catchErrors } = require("../../handlers/errorHandlers");

// :: Prefix Path ---  '/api/v1/maintenance'
router.post("/create", catchErrors(maintenanceController.createMaintenance));
router.get("/list", catchErrors(maintenanceController.getMaintenances));
router.put("/:maintenanceId/update", catchErrors(maintenanceController.updateMaintenance));

module.exports = router;
