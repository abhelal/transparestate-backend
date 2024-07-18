"use strict";
const express = require("express");
const router = express();

const propertyRoutes = require("./dev/property");

// :: Prefix Path ---  '/api/dev'

router.use("/property", propertyRoutes);

module.exports = router;
