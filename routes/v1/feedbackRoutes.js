const express = require("express");
const router = express();

const feedbackController = require("../../controllers/feedbackController");
const { protectRoute, allowAccess } = require("../../middleware/authMiddleware");
const { catchErrors } = require("../../handlers/errorHandlers");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/feedback'

router.post("/", protectRoute, catchErrors(feedbackController.create));
router.get("/", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(feedbackController.list));
router.get("/:id", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(feedbackController.get));
router.put("/:id", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(feedbackController.update));
router.delete("/:id", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(feedbackController.remove));

module.exports = router;
