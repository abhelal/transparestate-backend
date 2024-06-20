const express = require("express");
const router = express();
const { protectRoute, allowAccess } = require("../../middleware/authMiddleware");
const contentController = require("../../controllers/contentController");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/content'

router.post("/:name", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), contentController.createOrUpdate);
router.get("/:name", contentController.get);

module.exports = router;
