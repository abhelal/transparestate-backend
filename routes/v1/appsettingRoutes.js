const express = require("express");
const router = express.Router();
const appsettingsController = require("../../controllers/appSettingsController");

// :: Prefix Path ---  '/api/v1/app-settings/'

router.post("/property-type", appsettingsController.addPropertyType);
router.post("/service-type", appsettingsController.addServiceType);
router.post("/maintenance-status", appsettingsController.addMaintenanceStatus);
router.delete("/property-type/:type", appsettingsController.deletePropertyType);
router.delete("/service-type/:type", appsettingsController.deleteServiceType);
router.delete("/maintenance-status/:status", appsettingsController.deleteMaintenanceStatus);
router.get("/property-type", appsettingsController.getPropertyTypes);
router.get("/service-type", appsettingsController.getServiceTypes);
router.get("/maintenance-status", appsettingsController.getMaintenanceStatuses);

module.exports = router;
