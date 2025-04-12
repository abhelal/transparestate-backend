const express = require("express");
const router = express.Router();
const { catchErrors } = require("../../handlers/errorHandlers");
const providerController = require("../../controllers/providerController");

// :: Prefix Path ---  '/api/v1/provider'

router.put("/services", catchErrors(providerController.updateServices));
router.get("/list", catchErrors(providerController.getProviders));
router.get("/:providerId", catchErrors(providerController.getProvider));

module.exports = router;
