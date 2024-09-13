const express = require("express");
const router = express();

const contactController = require("../../controllers/contactController");
const { protectRoute, allowAccess } = require("../../middleware/authMiddleware");
const { catchErrors } = require("../../handlers/errorHandlers");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/contact'

router.post("/", catchErrors(contactController.createContact));
router.get("/", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(contactController.getContacts));
router.get("/:contactId", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(contactController.getContact));
router.put("/:contactId", protectRoute, allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(contactController.updateResponded));

module.exports = router;
