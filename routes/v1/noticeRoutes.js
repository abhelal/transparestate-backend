const express = require("express");
const router = express();
const { allowAccess, permissionCheck } = require("../../middleware/authMiddleware");
const { USER_ROLES, USER_PERMISSIONS } = require("../../constants");
const controller = require("../../controllers/noticeController");

// :: Prefix Path ---  '/api/v1/notice'

router.post("/", allowAccess([USER_ROLES.CLIENT, USER_ROLES.JANITOR, USER_ROLES.MAINTAINER]), controller.createNotice);
router.delete("/:noticeId", allowAccess([USER_ROLES.CLIENT, USER_ROLES.JANITOR, USER_ROLES.MAINTAINER]), controller.deleteNotice);
router.get("/list", permissionCheck(USER_PERMISSIONS.READ_NOTICE), controller.getNoticeList);

module.exports = router;
