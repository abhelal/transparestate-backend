const Constants = require("../models/constantModel");

exports.addPropertyType = async (req, res) => {
  try {
    const { propertyType } = req.body;
    const constants = await Constants.findOneAndUpdate({}, { $addToSet: { propertyTypes: propertyType } }, { new: true, upsert: true });
    res.json({ message: "Property type added successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to add property type" });
  }
};

exports.addServiceType = async (req, res) => {
  try {
    const { serviceType } = req.body;
    const constants = await Constants.findOneAndUpdate({}, { $addToSet: { serviceTypes: serviceType } }, { new: true, upsert: true });
    res.json({ message: "Service type added successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to add service type" });
  }
};

exports.addMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const constants = await Constants.findOneAndUpdate({}, { $addToSet: { maintenanceStatuses: status } }, { new: true, upsert: true });
    res.json({ message: "Maintenance status added successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to add maintenance status" });
  }
};

exports.deletePropertyType = async (req, res) => {
  try {
    const { type } = req.params;
    const constants = await Constants.findOneAndUpdate({}, { $pull: { propertyTypes: type } }, { new: true });
    res.json({ message: "Property type deleted successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete property type" });
  }
};

exports.deleteServiceType = async (req, res) => {
  try {
    const { type } = req.params;
    const constants = await Constants.findOneAndUpdate({}, { $pull: { serviceTypes: type } }, { new: true });
    res.json({ message: "Service type deleted successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service type" });
  }
};

exports.deleteMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const constants = await Constants.findOneAndUpdate({}, { $pull: { maintenanceStatuses: status } }, { new: true });
    res.json({ message: "Maintenance status deleted successfully", constants });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete maintenance status" });
  }
};

exports.getPropertyTypes = async (req, res) => {
  try {
    const constants = await Constants.findOne();
    res.json(constants.propertyTypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch property types" });
  }
};

exports.getServiceTypes = async (req, res) => {
  try {
    const constants = await Constants.findOne();
    res.json(constants.serviceTypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service types" });
  }
};

exports.getMaintenanceStatuses = async (req, res) => {
  try {
    const constants = await Constants.findOne();
    res.json(constants.maintenanceStatuses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance statuses" });
  }
};
