const express = require("express");
const router = express();
const clientController = require("../../controllers/clientController");
const { catchErrors } = require("../../handlers/errorHandlers");

// :: Prefix Path ---  '/api/v1/clients'

router.get("/", catchErrors(clientController.getClients));

module.exports = router;
