const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const messageController = require("../../controllers/messageController");
const { permissionCheck } = require("../../middleware/authMiddleware");
const { USER_PERMISSIONS } = require("../../constants");

// :: Prefix Path ---  '/api/v1/messages'
router.get("/", permissionCheck(USER_PERMISSIONS.READ_MESSAGE), catchErrors(messageController.getConversations));
router.post("/new/:id", permissionCheck(USER_PERMISSIONS.UPDATE_MESSAGE), catchErrors(messageController.startNewConversation));

router.get("/archived", permissionCheck(USER_PERMISSIONS.READ_MESSAGE), catchErrors(messageController.getArchivedConversations));
router.get("/recent-messages", permissionCheck(USER_PERMISSIONS.READ_MESSAGE), catchErrors(messageController.getRecentMessages));
router.get("/:conversationId", permissionCheck(USER_PERMISSIONS.READ_MESSAGE), catchErrors(messageController.getMessages));

router.post("/:conversationId", permissionCheck(USER_PERMISSIONS.UPDATE_MESSAGE), catchErrors(messageController.sendMessage));
router.put(
  "/:conversationId/archive",
  permissionCheck(USER_PERMISSIONS.UPDATE_MESSAGE),
  catchErrors(messageController.archiveConversation)
);
router.post("/:maintenanceId/start", permissionCheck(USER_PERMISSIONS.UPDATE_MESSAGE), catchErrors(messageController.startConversation));

module.exports = router;
