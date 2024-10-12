const express = require("express");
const router = express();
const controler = require("../../controllers/userController");
const { catchErrors } = require("../../handlers/errorHandlers");
const { allowAccess, permissionCheck } = require("../../middleware/authMiddleware");
const { USER_ROLES, USER_PERMISSIONS } = require("../../constants");

// :: Prefix Path ---  '/api/v1/user'

router.get("/clients", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(controler.getAllClients));
router.get("/clients/:userId", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(controler.getClient));
router.put("/clients/status/:userId", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(controler.updateClientStatus));

router.post("/maintainers", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.createMaintainer));
router.get("/maintainers", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.getAllMaintainers));
router.get("/maintainers/:userId", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.getMaintainer));

router.post("/janitors", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.createJanitor));
router.get("/janitors", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.getAllJanitors));
router.get("/janitors/:userId", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.getJanitor));

router.post("/tenants", permissionCheck(USER_PERMISSIONS.UPDATE_TENANT), catchErrors(controler.createTenant));
router.get("/tenants", permissionCheck(USER_PERMISSIONS.READ_TENANT), catchErrors(controler.getAllTenants));
router.get("/tenants/:userId", permissionCheck(USER_PERMISSIONS.READ_TENANT), catchErrors(controler.getTenant));

router.put("/update/info/:userId", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.updateInfo));
router.put("/update/status/:userId", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.updateStatus));
router.put("/update/permissions/:userId", allowAccess(USER_ROLES.CLIENT), catchErrors(controler.updatePermissions));
router.put("/update/properties/:userId", catchErrors(controler.updateProperties));
router.put("/update/password/:userId", catchErrors(controler.updatePassword));
router.delete("/delete/:userId", catchErrors(controler.deleteUser));

router.get("/profile", catchErrors(controler.getProfile));

module.exports = router;
