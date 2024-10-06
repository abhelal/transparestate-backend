const express = require("express");
const router = express();
const { allowAccess, permissionCheck } = require("../../middleware/authMiddleware");
const { USER_ROLES, USER_PERMISSIONS } = require("../../constants");
const controller = require("../../controllers/notificationController");

// :: Prefix Path ---  '/api/v1/notification'

router.post("/", allowAccess([USER_ROLES.CLIENT, USER_ROLES.JANITOR, USER_ROLES.MAINTAINER]), controller.createNotification);

router.delete(
  "/:notificationId",
  allowAccess([USER_ROLES.CLIENT, USER_ROLES.JANITOR, USER_ROLES.MAINTAINER]),
  controller.deleteNotification
);

router.get("/list", permissionCheck(USER_PERMISSIONS.READ_NOTICE), controller.getNotificationList);

module.exports = router;
