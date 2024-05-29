const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const storageController = require("../../controllers/storageController");

// :: Prefix Path ---  '/api/v1/storage'

router.get("/url/:Key", catchErrors(storageController.createPresignedUrl));
router.delete("/delete/:Key", catchErrors(storageController.deleteFile));

module.exports = router;
