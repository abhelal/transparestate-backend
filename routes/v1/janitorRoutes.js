const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const janitorController = require("../../controllers/janitorController");

// :: Prefix Path ---  '/api/v1/janitors'

router.get("/list", catchErrors(janitorController.getJanitors));
router.post("/create", catchErrors(janitorController.createJanitor));
router.get("/:id", catchErrors(janitorController.getJanitor));
router.put("/:id/update/info", catchErrors(janitorController.updateJanitorInfo));
router.put("/:id/update/password", catchErrors(janitorController.updateJanitorPassword));
router.put("/:id/update/properties", catchErrors(janitorController.updateJanitorProperties));
router.put("/:id/update/status", catchErrors(janitorController.updateJanitorStatus));
router.delete("/:id", catchErrors(janitorController.deleteJanitor));

module.exports = router;
