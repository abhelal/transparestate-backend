const express = require("express");
const router = express();

const userController = require("../../controllers/userController");

// :: Prefix Path ---  '/api/v1/users'

router.post("/create-tenants", userController.createTenants);
router.get("/list", userController.getUsers);
router.get("/:userId", userController.getUser);

module.exports = router;
