const express = require("express");
const router = express();
const { allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");
const notificationController = require("../../controllers/notificationController");

// :: Prefix Path ---  '/api/v1/notification'

router.post("/", allowAccess([USER_ROLES.CLIENT, USER_ROLES.JANITOR, USER_ROLES.MAINTAINER]), notificationController.createNotification);

router.delete(
  "/:notificationId",
  allowAccess([USER_ROLES.CLIENT, USER_ROLES.JANITOR, USER_ROLES.MAINTAINER]),
  notificationController.deleteNotification
);

router.get("/list", notificationController.getNotificationList);

module.exports = router;
