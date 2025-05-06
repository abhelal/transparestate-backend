const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const constantsSchema = new Schema({
  propertyTypes: [{ type: String, required: true }], // List of property types
  serviceTypes: [{ type: String, required: true }], // List of service types
  maintenanceStatuses: [{ type: String, required: true }], // List of maintenance statuses
});

module.exports = mongoose.model("Constants", constantsSchema);
