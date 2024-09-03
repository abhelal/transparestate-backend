const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const subscriptionController = require("../../controllers/subscriptionController");
const { allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/subscription'

router.get("/plan", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.getSubscriptionPlans));
router.post("/plan", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.createSubscriptionPlan));
router.put("/plan/:id", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.updateSubscriptionPlan));
router.delete("/plan/:id", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.deleteSubscriptionPlan));
router.put("/plan/make-popular/:id", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.makePopular));
router.put("/plan/deactivate/:id", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.deactivateSubscriptionPlan));

router.post("/active", allowAccess([USER_ROLES.CLIENT]), catchErrors(subscriptionController.activeSubscription));

router.get("/plans", catchErrors(subscriptionController.getPlans));

module.exports = router;
