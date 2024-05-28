const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const tenantController = require("../../controllers/tenantController");

// :: Prefix Path ---  '/api/v1/tenants'

router.put("/update/info/:id", catchErrors(tenantController.updateTenantInfo));
router.put("/update/apartment/:userId", catchErrors(tenantController.updateTenantApartment));
router.delete("/delete/apartment/:userId/:apartmentId", catchErrors(tenantController.deleteTenantApartment));

module.exports = router;
