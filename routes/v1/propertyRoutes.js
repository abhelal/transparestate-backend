const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");

const propertyController = require("../../controllers/propertyController");

// :: Prefix Path ---  '/api/v1/properties'

router.post("/create", catchErrors(propertyController.createProperty));
router.get("/list", catchErrors(propertyController.getProperties));
router.get("/:id", catchErrors(propertyController.getProperty));

module.exports = router;
