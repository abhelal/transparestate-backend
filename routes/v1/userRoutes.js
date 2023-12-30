const express = require("express");
const router = express();

const userController = require("../../controllers/userController");

// :: Prefix Path ---  '/api/v1/user'

router.post("/create-tenants", userController.createTenants);

module.exports = router;
