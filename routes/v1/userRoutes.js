const express = require("express");
const router = express();
const controler = require("../../controllers/userController");
const { catchErrors } = require("../../handlers/errorHandlers");
const { allowAccess } = require("../../middleware/authMiddleware");
const { USER_ROLES } = require("../../constants");

// :: Prefix Path ---  '/api/v1/user'

router.get("/clients", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(controler.getAllClients));
router.get("/clients/:userId", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(controler.getClient));
router.put("/clients/status/:userId", allowAccess([USER_ROLES.SUPERADMIN]), catchErrors(controler.updateClientStatus));

router.post("/managers", catchErrors(controler.createManager));
router.get("/managers", catchErrors(controler.getAllManagers));
router.get("/managers/:userId", catchErrors(controler.getManager));

router.post("/maintainers", catchErrors(controler.createMaintainer));
router.get("/maintainers", catchErrors(controler.getAllMaintainers));
router.get("/maintainers/:userId", catchErrors(controler.getMaintainer));

router.post("/janitors", catchErrors(controler.createJanitor));
router.get("/janitors", catchErrors(controler.getAllJanitors));
router.get("/janitors/:userId", catchErrors(controler.getJanitor));

router.post("/tenants", catchErrors(controler.createTenant));
router.get("/tenants", catchErrors(controler.getAllTenants));
router.get("/tenants/:userId", catchErrors(controler.getTenant));

router.put("/update/info/:userId", catchErrors(controler.updateInfo));
router.put("/update/status/:userId", catchErrors(controler.updateStatus));
router.put("/update/permissions/:userId", catchErrors(controler.updatePermissions));
router.put("/update/properties/:userId", catchErrors(controler.updateProperties));
router.put("/update/password/:userId", catchErrors(controler.updatePassword));
router.delete("/delete/:userId", catchErrors(controler.deleteUser));

module.exports = router;
