const express = require("express");
const router = express();
const { catchErrors } = require("../../handlers/errorHandlers");
const { allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");
const couponController = require("../../controllers/couponController");

// :: Prefix Path ---  '/api/v1/coupons'

router.get("/", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(couponController.getAllCoupons));
router.post(
  "/",
  allowAccess([USER_ROLES.SUPERADMIN]),
  catchErrors(couponController.generateCoupon)
);

router.delete(
  "/:id",
  allowAccess([USER_ROLES.SUPERADMIN]),
  catchErrors(couponController.deleteCoupon)
);

module.exports = router;
