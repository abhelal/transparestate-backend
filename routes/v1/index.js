"use strict";
const express = require("express");
const router = express();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");
// :: Prefix Path ---  '/api/v1'

router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/company", companyRoutes);

module.exports = router;
