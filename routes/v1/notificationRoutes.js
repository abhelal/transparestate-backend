const express = require("express");
const router = express();
const controller = require("../../controllers/notificationController");

// :: Prefix Path ---  '/api/v1/notification'

router.get("/", controller.getNotifications);
router.put("/:notificationId/read", controller.markAsRead);
router.put("/:notificationId/unread", controller.markAsUnread);

module.exports = router;
