const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const tenantController = require("../../controllers/tenantController");

// :: Prefix Path ---  '/api/v1/tenants'

router.get("/list", catchErrors(tenantController.getTenants));
router.post("/create", catchErrors(tenantController.createTenant));
router.get("/:id", catchErrors(tenantController.getTenant));
router.put("/:id/update/info", catchErrors(tenantController.updateTenantInfo));
router.put("/:id/update/home", catchErrors(tenantController.updateTenantHome));

router.put("/:id/update/password", catchErrors(tenantController.updateMaintainerPassword));
router.put("/:id/update/properties", catchErrors(tenantController.updateMaintainerProperties));
router.put("/:id/update/status", catchErrors(tenantController.updateMaintainerStatus));
router.delete("/:id", catchErrors(tenantController.deleteMaintainer));

module.exports = router;
