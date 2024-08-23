const Maintenance = require("../models/maintenanceModel");
const Property = require("../models/propertyModel");

exports.getProperties = async (req, res) => {
  try {
    const type = req.query.type;
    const query = {};
    if (type) query.propertyType = type;
    const properties = await Property.find(query).populate("apartments").lean();

    return res.status(200).json({ success: true, properties });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find({ client: req.client });
    return res.status(200).json({ success: true, maintenance: maintenance });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
