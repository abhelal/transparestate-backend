const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const tenantController = require("../../controllers/tenantController");
const { uploadFile } = require("../../services/storage");

// :: Prefix Path ---  '/api/v1/tenants'

router.put("/info/update/:userId", catchErrors(tenantController.updateTenantInfo));

router.post("/apartment/add/:userId", catchErrors(tenantController.addTenantApartment));
router.put("/apartment/update/:userId", catchErrors(tenantController.updateTenantApartment));
router.delete("/apartment/delete/:userId/:apartmentId", catchErrors(tenantController.deleteTenantApartment));

router.post("/create/document/:userId", uploadFile.single("documentFile"), catchErrors(tenantController.createTenantDocument));
router.delete("/delete/document/:userId/:Key", catchErrors(tenantController.deleteTenantDocument));

// tenants routes
router.get("/myapartment", catchErrors(tenantController.getMyApartment));
router.get("/mybills", catchErrors(tenantController.getMyBills));

module.exports = router;
