"use strict";
const express = require("express");
const router = express();
const { protectRoute, allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const couponRoutes = require("./couponRoutes");

const subscriptionRoutes = require("./subscriptionRoutes");
const propertyRoutes = require("./propertyRoutes");
const managerRoutes = require("./managerRoutes");
const maintainerRoutes = require("./maintainerRoutes");
const janitorRoutes = require("./janitorRoutes");
const tenantRoutes = require("./tenantRoutes");
const maintenanceRoutes = require("./maintenanceRoutes");
const storageRoutes = require("./storageRoutes");
const messageRoutes = require("./messageRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const contentRoures = require("./contentRoutes");
const utilityRoutes = require("./utilityRoutes");
const notificationRoutes = require("./notificationRoutes");

// :: Prefix Path ---  '/api/v1'

router.use("/auth", authRoutes);
router.use("/user", protectRoute, userRoutes);
router.use("/coupons", protectRoute, couponRoutes);
router.use("/subscription", protectRoute, subscriptionRoutes);
router.use("/properties", protectRoute, propertyRoutes);
router.use("/managers", protectRoute, allowAccess([USER_ROLES.CLIENT]), managerRoutes);
router.use("/maintainers", protectRoute, allowAccess([USER_ROLES.CLIENT]), maintainerRoutes);
router.use("/janitors", protectRoute, allowAccess([USER_ROLES.CLIENT]), janitorRoutes);
router.use("/tenants", protectRoute, tenantRoutes);
router.use("/maintenance", protectRoute, maintenanceRoutes);
router.use("/storage", protectRoute, storageRoutes);
router.use("/messages", protectRoute, messageRoutes);
router.use("/dashboard", protectRoute, dashboardRoutes);
router.use("/content", contentRoures);
router.use("/utility", protectRoute, utilityRoutes);
router.use("/notification", protectRoute, notificationRoutes);

module.exports = router;
