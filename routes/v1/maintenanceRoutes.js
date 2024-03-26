const express = require("express");
const router = express();
const maintenanceController = require("../../controllers/maintenanceControler");
const companyController = require("../../controllers/companyController");
const { catchErrors } = require("../../handlers/errorHandlers");

// :: Prefix Path ---  '/api/v1/maintenance'

router.post("/create", catchErrors(maintenanceController.createMaintenance));
router.get("/list", catchErrors(maintenanceController.getMaintenances));

router.get("/:id", catchErrors(companyController.getCompany));
router.put("/:id/update", catchErrors(companyController.updateCompany));
router.put("/:id/archive", catchErrors(companyController.archiveCompany));

module.exports = router;
