const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const maintainerController = require("../../controllers/maintainerController");

// :: Prefix Path ---  '/api/v1/maintainers'

router.get("/list", catchErrors(maintainerController.getMaintainers));
router.post("/create", catchErrors(maintainerController.createMaintainer));
router.get("/:id", catchErrors(maintainerController.getMaintainer));
router.put("/:id/update/info", catchErrors(maintainerController.updateMaintainerInfo));
router.put("/:id/update/password", catchErrors(maintainerController.updateMaintainerPassword));
router.put("/:id/update/properties", catchErrors(maintainerController.updateMaintainerProperties));
router.put("/:id/update/status", catchErrors(maintainerController.updateMaintainerStatus));
router.delete("/:id", catchErrors(maintainerController.deleteMaintainer));

module.exports = router;
