const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const messageController = require("../../controllers/messageController");
const { permissionCheck } = require("../../middleware/authMiddleware");
const { USER_PERMISSIONS } = require("../../constants");

// :: Prefix Path ---  '/api/v1/messages'
router.get("/", permissionCheck(USER_PERMISSIONS.READ_MESSAGE), catchErrors(messageController.getConversations));
router.get("/recent-messages", permissionCheck(USER_PERMISSIONS.READ_MESSAGE), catchErrors(messageController.getRecentMessages));
router.get("/:conversationId", permissionCheck(USER_PERMISSIONS.READ_MESSAGE), catchErrors(messageController.getMessages));

router.post("/:conversationId", permissionCheck(USER_PERMISSIONS.UPDATE_MESSAGE), catchErrors(messageController.sendMessage));
router.post("/:maintenanceId/start", permissionCheck(USER_PERMISSIONS.UPDATE_MESSAGE), catchErrors(messageController.startConversation));

module.exports = router;
