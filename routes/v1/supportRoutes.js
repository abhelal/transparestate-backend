const express = require("express");
const router = express();

const { allowAccess, denyAccess } = require("../../middleware/authMiddleware");
const { catchErrors } = require("../../handlers/errorHandlers");
const { USER_ROLES } = require("../../constants");
const supportController = require("../../controllers/supportController");

// :: Prefix Path ---  '/api/v1/support'

router.post("/ticket", denyAccess(USER_ROLES.SUPERADMIN), catchErrors(supportController.createSupportTicket));
router.get("/mytickets", denyAccess(USER_ROLES.SUPERADMIN), catchErrors(supportController.getMyTickets));

router.post("/ticketbyadmin", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(supportController.createSupportTicketByAdmin));
router.get("/tickets", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(supportController.getAllTickets));
router.get("/tickets-open", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(supportController.getOpenTickets));
router.put("/ticket/:id", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(supportController.updateTicketStatus));

module.exports = router;
