const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const tenantController = require("../../controllers/tenantController");
const { uploadFile } = require("../../services/storage");

// :: Prefix Path ---  '/api/v1/tenants'

router.put("/update/info/:userId", catchErrors(tenantController.updateTenantInfo));
router.put("/update/apartment/:userId", catchErrors(tenantController.updateTenantApartment));
router.post("/create/document/:userId", uploadFile.single("documentFile"), catchErrors(tenantController.createTenantDocument));
router.delete("/delete/document/:userId/:Key", catchErrors(tenantController.deleteTenantDocument));
router.delete("/delete/apartment/:userId/:apartmentId", catchErrors(tenantController.deleteTenantApartment));

// tenants routes
router.get("/myapartment", catchErrors(tenantController.getMyApartment));

module.exports = router;
