const express = require("express");
const router = express();

const { protectRoute } = require("../../middleware/authMiddleware");
const authControler = require("../../controllers/authController");
const { catchErrors } = require("../../handlers/errorHandlers");

// :: Prefix Path ---  '/api/v1/auth'

router.post("/register", catchErrors(authControler.register));
router.post("/login", catchErrors(authControler.login));
router.post("/logout", protectRoute, catchErrors(authControler.logout));
router.post("/logout-others", protectRoute, catchErrors(authControler.logoutOthers));
router.post("/logout-all", protectRoute, catchErrors(authControler.logoutAll));
router.get("/me", protectRoute, catchErrors(authControler.me));
router.get("/address", protectRoute, catchErrors(authControler.getAddress));
router.get("/settings", protectRoute, catchErrors(authControler.getSettings));
router.post("/update-password", protectRoute, catchErrors(authControler.updatePassword));
router.post("/update-address", protectRoute, catchErrors(authControler.updateAddress));
router.post("/update-notifications", protectRoute, catchErrors(authControler.updateNotifications));

module.exports = router;
