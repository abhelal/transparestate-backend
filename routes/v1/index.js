"use strict";
const express = require("express");
const router = express();
const { protectRoute, allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const couponRoutes = require("./couponRoutes");
const appSettingRoutes = require("./appsettingRoutes");

const subscriptionRoutes = require("./subscriptionRoutes");
const propertyRoutes = require("./propertyRoutes");
const maintainerRoutes = require("./maintainerRoutes");
const janitorRoutes = require("./janitorRoutes");
const tenantRoutes = require("./tenantRoutes");
const providerRoutes = require("./providerRoutes");
const maintenanceRoutes = require("./maintenanceRoutes");
const storageRoutes = require("./storageRoutes");
const messageRoutes = require("./messageRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const contentRoures = require("./contentRoutes");
const utilityRoutes = require("./utilityRoutes");
const noticeRoutes = require("./noticeRoutes");
const billRoutes = require("./billRoutes");
const reportRoutes = require("./reportRoutes");
const contactRoutes = require("./contactRoutes");
const feedbackRoutes = require("./feedbackRoutes");
const supportRoutes = require("./supportRoutes");
const notificationRoutes = require("./notificationRoutes");

// :: Prefix Path ---  '/api/v1'

router.use("/auth", authRoutes);
router.use("/user", protectRoute, userRoutes);
router.use("/coupons", protectRoute, couponRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/app-settings", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), appSettingRoutes);
router.use("/properties", protectRoute, propertyRoutes);
router.use("/maintainers", protectRoute, allowAccess([USER_ROLES.CLIENT]), maintainerRoutes);
router.use("/janitors", protectRoute, allowAccess([USER_ROLES.CLIENT]), janitorRoutes);
router.use("/tenants", protectRoute, tenantRoutes);
router.use("/provider", protectRoute, providerRoutes);
router.use("/maintenance", protectRoute, maintenanceRoutes);
router.use("/storage", protectRoute, storageRoutes);
router.use("/messages", protectRoute, messageRoutes);
router.use("/dashboard", protectRoute, dashboardRoutes);
router.use("/content", contentRoures);
router.use("/feedback", protectRoute, feedbackRoutes);
router.use("/utility", protectRoute, utilityRoutes);
router.use("/notice", protectRoute, noticeRoutes);
router.use("/bills", protectRoute, billRoutes);
router.use("/reports", protectRoute, reportRoutes);
router.use("/contact", contactRoutes);
router.use("/support", protectRoute, supportRoutes);
router.use("/notification", protectRoute, notificationRoutes);

module.exports = router;
