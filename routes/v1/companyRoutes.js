const express = require("express");
const router = express();
const companyController = require("../../controllers/companyController");
const { catchErrors } = require("../../handlers/errorHandlers");

// :: Prefix Path ---  '/api/v1/company'

router.post("/create", catchErrors(companyController.createCompany));
router.get("/list", catchErrors(companyController.getCompanies));
router.get("/:id", catchErrors(companyController.getCompany));
router.put("/:id/update", catchErrors(companyController.updateCompany));
router.put("/:id/archive", catchErrors(companyController.archiveCompany));

module.exports = router;
