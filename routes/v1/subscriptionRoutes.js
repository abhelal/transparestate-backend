const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const subscriptionController = require("../../controllers/subscriptionController");
const { allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/subscription'

router.post(
  "/active",
  allowAccess([USER_ROLES.CLIENT]),
  catchErrors(subscriptionController.activeSubscription)
);

module.exports = router;
