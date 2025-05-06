const express = require("express");
const router = express.Router();
const Constants = require("../../models/constantModel");

// :: Prefix Path ---  '/api/v1/app-settings/'
// Add new property type
router.post("/property-type", async (req, res) => {
  try {
    const { propertyType } = req.body;
    const constants = await Constants.findOneAndUpdate({}, { $addToSet: { propertyTypes: propertyType } }, { new: true, upsert: true });
    res.json({ message: "Property type added successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to add property type" });
  }
});
// Add new service type
router.post("/service-type", async (req, res) => {
  try {
    const { serviceType } = req.body;
    const constants = await Constants.findOneAndUpdate({}, { $addToSet: { serviceTypes: serviceType } }, { new: true, upsert: true });
    res.json({ message: "Service type added successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to add service type" });
  }
});
// Add new maintenance status
router.post("/maintenance-status", async (req, res) => {
  try {
    const { maintenanceStatus } = req.body;
    const constants = await Constants.findOneAndUpdate(
      {},
      { $addToSet: { maintenanceStatuses: maintenanceStatus } },
      { new: true, upsert: true }
    );
    res.json({ message: "Maintenance status added successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to add maintenance status" });
  }
});
// Delete property type
router.delete("/property-type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const constants = await Constants.findOneAndUpdate({}, { $pull: { propertyTypes: type } }, { new: true });
    res.json({ message: "Property type deleted successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete property type" });
  }
});
// Delete service type
router.delete("/service-type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const constants = await Constants.findOneAndUpdate({}, { $pull: { serviceTypes: type } }, { new: true });
    res.json({ message: "Service type deleted successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service type" });
  }
});
// Delete maintenance status
router.delete("/maintenance-status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const constants = await Constants.findOneAndUpdate({}, { $pull: { maintenanceStatuses: status } }, { new: true });
    res.json({ message: "Maintenance status deleted successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete maintenance status" });
  }
});
// Get all property types
router.get("/property-types", async (req, res) => {
  try {
    const constants = await Constants.findOne();
    res.json(constants.propertyTypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch property types" });
  }
});
// Get all service types
router.get("/service-types", async (req, res) => {
  try {
    const constants = await Constants.findOne();
    res.json(constants.serviceTypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service types" });
  }
});
// Get all maintenance statuses
router.get("/maintenance-statuses", async (req, res) => {
  try {
    const constants = await Constants.findOne();
    res.json(constants.maintenanceStatuses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance statuses" });
  }
});

module.exports = router;
