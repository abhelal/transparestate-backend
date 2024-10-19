const express = require("express");
const router = express();
const billsController = require("../../controllers/billsController");
const { allowAccess, permissionCheck } = require("../../middleware/authMiddleware");
const { USER_ROLES, USER_PERMISSIONS } = require("../../constants");
const { catchErrors } = require("../../handlers/errorHandlers");

// :: Prefix Path ---  '/api/v1/bills'

router.get("/mybills", allowAccess([USER_ROLES.TENANT]), catchErrors(billsController.getMyBills));

router.get(
  "/all",
  allowAccess([USER_ROLES.CLIENT, USER_ROLES.MAINTAINER, USER_ROLES.JANITOR]),
  permissionCheck(USER_PERMISSIONS.READ_BILL),
  catchErrors(billsController.getAllBills)
);
router.put(
  "/:billId/update",
  allowAccess([USER_ROLES.CLIENT, USER_ROLES.MAINTAINER, USER_ROLES.JANITOR]),
  permissionCheck(USER_PERMISSIONS.UPDATE_BILL),
  catchErrors(billsController.updateBillStatus)
);

module.exports = router;
