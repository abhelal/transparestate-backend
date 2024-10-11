const express = require("express");
const router = express.Router();
const { catchErrors } = require("../../handlers/errorHandlers");
const tenantController = require("../../controllers/tenantController");
const { uploadFile } = require("../../services/storage");
const { permissionCheck, allowAccess } = require("../../middleware/authMiddleware");
const { USER_PERMISSIONS, USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/tenants'

router.put("/info/update/:userId", permissionCheck(USER_PERMISSIONS.UPDATE_TENANT), catchErrors(tenantController.updateTenantInfo));

router.post("/apartment/add/:userId", permissionCheck(USER_PERMISSIONS.UPDATE_TENANT), catchErrors(tenantController.addTenantApartment));
router.put(
  "/apartment/update/:userId",
  permissionCheck(USER_PERMISSIONS.UPDATE_TENANT),
  catchErrors(tenantController.updateTenantApartment)
);
router.delete(
  "/apartment/delete/:userId/:apartmentId",
  permissionCheck(USER_PERMISSIONS.UPDATE_TENANT),
  catchErrors(tenantController.deleteTenantApartment)
);

router.post(
  "/create/document/:userId",
  permissionCheck(USER_PERMISSIONS.UPDATE_TENANT),
  uploadFile.single("documentFile"),
  catchErrors(tenantController.createTenantDocument)
);
router.delete(
  "/delete/document/:userId/:Key",
  permissionCheck(USER_PERMISSIONS.UPDATE_TENANT),
  catchErrors(tenantController.deleteTenantDocument)
);

// tenants routes
router.get("/myapartment", allowAccess([USER_ROLES.TENANT]), catchErrors(tenantController.getMyApartment));
router.get("/mybills", allowAccess([USER_ROLES.TENANT]), catchErrors(tenantController.getMyBills));

module.exports = router;
