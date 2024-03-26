const User = require("../models/userModel");
const Maintenance = require("../models/maintenanceModel");
const Joi = require("joi");

exports.createMaintenance = async (req, res) => {
  const schema = Joi.object({
    maintenanceType: Joi.string().required(),
    maintenanceDetails: Joi.string().required(),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(409).json({
      success: false,
      message: error.details.map((err) => err.message),
    });
  }

  const tenant = await User.findOne({ userId: req.userId })
    .select("-password -accessToken")
    .populate("apartments");

  const apartment = tenant.apartments[0];

  const { maintenanceType, maintenanceDetails } = value;

  const newMaintenance = new Maintenance({
    property: apartment.property,
    apartment: apartment._id,
    tenant: tenant._id,
    maintenanceType,
    maintenanceDetails,
  });

  await newMaintenance.save();
  return res.status(200).json({
    success: true,
    message: "Maintenance created successfully",
  });
};

exports.getMaintenances = async (req, res) => {
  const user = await User.findOne({ userId: req.userId });
  const maintenances = await Maintenance.find({ tenant: user._id })
    .populate("property", "name street buildingNo zipCode city country")
    .populate("apartment", "floor door")
    .sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    maintenances,
  });
};
