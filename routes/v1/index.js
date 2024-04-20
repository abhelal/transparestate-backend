"use strict";
const express = require("express");
const router = express();
const { protectRoute, allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const couponRoutes = require("./couponRoutes");
const clientRoutes = require("./clientRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const propertyRoutes = require("./propertyRoutes");
const maintainerRoutes = require("./maintainerRoutes");
const tenantRoutes = require("./tenantRoutes");
const maintenanceRoutes = require("./maintenanceRoutes");

// :: Prefix Path ---  '/api/v1'

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/coupons", protectRoute, couponRoutes);
router.use("/clients", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), clientRoutes);
router.use("/subscription", protectRoute, subscriptionRoutes);
router.use("/properties", protectRoute, propertyRoutes);
router.use("/maintainers", protectRoute, allowAccess([USER_ROLES.ADMIN]), maintainerRoutes);
router.use("/tenants", protectRoute, tenantRoutes);
router.use("/maintenance", protectRoute, maintenanceRoutes);

module.exports = router;
