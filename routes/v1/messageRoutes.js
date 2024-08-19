const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const messageController = require("../../controllers/messageController");

// :: Prefix Path ---  '/api/v1/messages'
router.get("/", catchErrors(messageController.getConversations));
router.get("/recent-messages", catchErrors(messageController.getRecentMessages));
router.get("/:conversationId", catchErrors(messageController.getMessages));
router.post("/:conversationId", catchErrors(messageController.sendMessage));
router.post("/:maintenanceId/start", catchErrors(messageController.startConversation));

module.exports = router;
