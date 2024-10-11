const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");

const propertyController = require("../../controllers/propertyController");
const { permissionCheck } = require("../../middleware/authMiddleware");
const { USER_PERMISSIONS } = require("../../constants");

// :: Prefix Path ---  '/api/v1/properties'

router.get("/list", permissionCheck(USER_PERMISSIONS.READ_PROPERTY), catchErrors(propertyController.getProperties));
router.get("/:id", permissionCheck(USER_PERMISSIONS.READ_PROPERTY), catchErrors(propertyController.getProperty));
router.get("/:propertyId/apartments", permissionCheck(USER_PERMISSIONS.READ_PROPERTY), catchErrors(propertyController.getApartments));
router.get(
  "/:propertyId/apartments/:apartmentId",
  permissionCheck(USER_PERMISSIONS.READ_PROPERTY),
  catchErrors(propertyController.getApartment)
);

router.post("/create", permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY), catchErrors(propertyController.createProperty));
router.put("/:id/update", permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY), catchErrors(propertyController.updateProperty));
router.put("/:id/archive", permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY), catchErrors(propertyController.archiveProperty));
router.put("/:id/amenities", permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY), catchErrors(propertyController.updateAmenities));
router.put("/:id/utilities", permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY), catchErrors(propertyController.updateUtilities));
router.put("/:id/allowpets", permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY), catchErrors(propertyController.allowPets));
router.post("/:id/apartments/create", permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY), catchErrors(propertyController.createApartment));
router.put(
  "/:propertyId/apartments/:apartmentId",
  permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY),
  catchErrors(propertyController.updateApartment)
);
router.delete(
  "/:propertyId/apartments/:apartmentId",
  permissionCheck(USER_PERMISSIONS.UPDATE_PROPERTY),
  catchErrors(propertyController.deleteApartment)
);

module.exports = router;
