const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const tenantController = require("../../controllers/tenantController");

// :: Prefix Path ---  '/api/v1/tenants'

router.put("/update/info/:id", catchErrors(tenantController.updateTenantInfo));
router.put("/update/home/:id", catchErrors(tenantController.updateTenantHome));

module.exports = router;
