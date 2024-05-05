const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const managerController = require("../../controllers/managerController");

// :: Prefix Path ---  '/api/v1/managers'

router.get("/list", catchErrors(managerController.getManagers));
router.post("/create", catchErrors(managerController.createManager));
router.get("/:id", catchErrors(managerController.getManager));
router.put("/:id/update/info", catchErrors(managerController.updateManagerInfo));
router.put("/:id/update/password", catchErrors(managerController.updateManagerPassword));
router.put("/:id/update/properties", catchErrors(managerController.updateManagerProperties));
router.put("/:id/update/status", catchErrors(managerController.updateManagerStatus));
router.delete("/:id", catchErrors(managerController.deleteManager));

module.exports = router;
