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

module.exports = router;
