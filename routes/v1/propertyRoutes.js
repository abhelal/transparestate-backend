const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");

const propertyController = require("../../controllers/propertyController");

// :: Prefix Path ---  '/api/v1/properties'

router.post("/create", catchErrors(propertyController.createProperty));
router.get("/list", catchErrors(propertyController.getProperties));
router.get("/:id", catchErrors(propertyController.getProperty));
router.put("/:id/update", catchErrors(propertyController.updateProperty));
router.put("/:id/archive", catchErrors(propertyController.archiveProperty));
router.put("/:id/amenities", catchErrors(propertyController.updateAmenities));
router.put("/:id/allowpets", catchErrors(propertyController.allowPets));

router.post("/:id/apartments/create", catchErrors(propertyController.createApartment));
router.get("/:propertyId/apartments/:apartmentId", catchErrors(propertyController.getApartment));
router.put("/:propertyId/apartments/:apartmentId", catchErrors(propertyController.updateApartment));
router.delete(
  "/:propertyId/apartments/:apartmentId",
  catchErrors(propertyController.deleteApartment)
);

module.exports = router;
