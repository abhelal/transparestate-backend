"use strict";
const express = require("express");
const router = express();
const { protectRoute, allowAccess } = require("../../middleware/authMiddleware");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");
const propertyRoutes = require("./propertyRoutes");
const maintainerRoutes = require("./maintainerRoutes");
const tenantRoutes = require("./tenantRoutes");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1'

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/company", protectRoute, companyRoutes);
router.use("/properties", protectRoute, propertyRoutes);
router.use("/maintainers", protectRoute, allowAccess([USER_ROLES.ADMIN]), maintainerRoutes);
router.use("/tenants", protectRoute, tenantRoutes);

module.exports = router;
