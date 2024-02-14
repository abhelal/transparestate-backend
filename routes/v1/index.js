"use strict";
const express = require("express");
const router = express();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");
const { protectRoute } = require("../../middleware/authMiddleware");
// :: Prefix Path ---  '/api/v1'

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/company", protectRoute, companyRoutes);

module.exports = router;
