const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const tenantController = require("../../controllers/tenantController");

// :: Prefix Path ---  '/api/v1/tenants'

router.get("/:id", catchErrors(tenantController.getTenant));
router.put("/:id/update/info", catchErrors(tenantController.updateTenantInfo));
router.put("/:id/update/home", catchErrors(tenantController.updateTenantHome));

module.exports = router;
