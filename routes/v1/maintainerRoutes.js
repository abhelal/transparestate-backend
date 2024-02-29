const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const maintainerController = require("../../controllers/maintainerController");

// :: Prefix Path ---  '/api/v1/maintainers'

router.get("/list", catchErrors(maintainerController.getMaintainers));
router.post("/create", catchErrors(maintainerController.createMaintainer));

module.exports = router;
