const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const subscriptionController = require("../../controllers/subscriptionController");
const { allowAccess, protectRoute } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/subscription'

router.get("/plan", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.getSubscriptionPlans));
router.post("/plan", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.createSubscriptionPlan));
router.put("/plan/:id", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.updateSubscriptionPlan));
router.delete("/plan/:id", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.deleteSubscriptionPlan));
router.put("/plan/make-popular/:id", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.makePopular));
router.put("/plan/deactivate/:id", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(subscriptionController.deactivatePlan));

router.post("/active", protectRoute, allowAccess([USER_ROLES.CLIENT]), catchErrors(subscriptionController.activeSubscription));
router.get("/plans", catchErrors(subscriptionController.getPlans));
router.get("/plans/:id", catchErrors(subscriptionController.getPlanById));

router.post("/active-by-code", protectRoute, allowAccess([USER_ROLES.CLIENT]), catchErrors(subscriptionController.activeByCode));
router.get("/my-subscription", protectRoute, allowAccess([USER_ROLES.CLIENT]), catchErrors(subscriptionController.getMySubscription));
router.get("/my-bill", protectRoute, allowAccess([USER_ROLES.CLIENT]), catchErrors(subscriptionController.getMyBills));

module.exports = router;
