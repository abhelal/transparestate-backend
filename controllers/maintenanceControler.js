const User = require("../models/userModel");
const Maintenance = require("../models/maintenanceModel");
const Joi = require("joi");
const { USER_ROLES } = require("../constants");

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
    company: tenant.company,
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

  let query = {};
  if (user.role === USER_ROLES.TENANT) {
    query.tenant = user._id;
  }

  if (user.role === USER_ROLES.MAINTAINER) {
    query.property = { $in: user.properties };
  }

  if (user.role === USER_ROLES.ADMIN) {
    query.company = user.company;
  }

  const maintenances = await Maintenance.find(query)
    .populate("property", "name street buildingNo zipCode city country")
    .populate("apartment", "floor door")
    .sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    maintenances,
  });
};
