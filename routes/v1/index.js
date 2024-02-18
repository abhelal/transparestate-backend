"use strict";
const express = require("express");
const router = express();
const { protectRoute } = require("../../middleware/authMiddleware");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");
const propertyRoutes = require("./propertyRoutes");
// :: Prefix Path ---  '/api/v1'

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/company", protectRoute, companyRoutes);
router.use("/properties", protectRoute, propertyRoutes);

module.exports = router;
