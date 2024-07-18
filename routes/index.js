"use strict";
const express = require("express");
const router = express();
const { catchErrors } = require("../handlers/errorHandlers");

const v1Routes = require("./v1");
const v2Routes = require("./v2");
const devRoutes = require("./devRoutes");

// :: Prefix Path ---  '/api'

router.use("/v1", v1Routes);
router.use("/v2", v2Routes);
router.use("/dev", devRoutes);

module.exports = router;
