const User = require("../models/userModel");
const Maintenance = require("../models/maintenanceModel");
const Joi = require("joi");
const { USER_ROLES } = require("../constants");
const Apartment = require("../models/apartmentModel");
const Notification = require("../models/notificationModel");
const socket = require("../socket");

exports.createMaintenance = async (req, res) => {
  const schema = Joi.object({
    apartmentId: Joi.string().required(),
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

  const { apartmentId, maintenanceType, maintenanceDetails } = value;

  const apartment = await Apartment.findOne({ apartmentId, client: req.client }).populate("property", "name client maintainers janitors");

  const newMaintenance = new Maintenance({
    client: apartment.client,
    property: apartment.property,
    apartment: apartment._id,
    tenant: apartment.tenant,
    maintenanceType,
    maintenanceDetails,
  });

  await newMaintenance.save();

  // create notification for client, maintainers, and janitors
  const maintainers = apartment.property.maintainers;
  const janitors = apartment.property.janitors;
  const sendTo = [...maintainers, ...janitors, apartment.client];

  sendTo.forEach(async (user) => {
    const notification = new Notification({
      user,
      message: `${apartment.floor}-${apartment.door}, ${apartment.property.name} has a new maintenance request`,
      href: `/maintenance/${newMaintenance.maintenanceId}`,
    });

    await notification.save();
    socket.emitNotification(notification);
  });

  return res.status(200).json({
    success: true,
    message: "Maintenance created successfully",
  });
};

exports.getMaintenances = async (req, res) => {
  const user = await User.findOne({ userId: req.userId });
  const page = Number(req.query.page) || 1;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  let query = {};
  if (user.role === USER_ROLES.TENANT) {
    query.tenant = user._id;
  }

  if (user.role === USER_ROLES.MAINTAINER || user.role === USER_ROLES.JANITOR) {
    query.property = { $in: user.properties };
  }

  if (user.role === USER_ROLES.CLIENT) {
    query.client = user.client;
  }

  const maintenances = await Maintenance.find(query)
    .limit(10)
    .skip((page - 1) * 10)
    .populate("property", "name street buildingNo zipCode city country")
    .populate("apartment", "floor door")
    .sort({ createdAt: -1 });

  const total = await Maintenance.countDocuments(query);

  return res.status(200).json({
    success: true,
    maintenances,
    totalPages: Math.ceil(total / 10),
  });
};

exports.getMaintenance = async (req, res) => {
  const { maintenanceId } = req.params;

  const maintenance = await Maintenance.findOne({ maintenanceId })
    .populate("property", "name street buildingNo zipCode city country")
    .populate("apartment", "floor door");

  if (!maintenance) {
    return res.status(404).json({
      success: false,
      message: "Maintenance not found",
    });
  }

  return res.status(200).json({
    success: true,
    maintenance,
  });
};

exports.updateMaintenance = async (req, res) => {
  const { maintenanceId } = req.params;
  const { status } = req.body;

  const maintenance = await Maintenance.findOne({ maintenanceId }).populate("apartment property");

  if (!maintenance) {
    return res.status(404).json({
      success: false,
      message: "Maintenance not found",
    });
  }

  if (maintenance.maintenanceStatus === "COMPLETED") {
    return res.status(409).json({
      success: false,
      message: "Maintenance already completed",
    });
  }

  if (maintenance.maintenanceStatus === "CANCELLED") {
    return res.status(409).json({
      success: false,
      message: "Maintenance already cancelled",
    });
  }

  maintenance.maintenanceStatus = status;
  await maintenance.save();

  // send notification to tenant
  const notification = new Notification({
    user: maintenance.tenant,
    message: `Maintenance request for ${maintenance.apartment.floor}-${maintenance.apartment.door}, ${
      maintenance.property.name
    } is ${status.toLowerCase()}`,
    href: `/maintenance/${maintenance.maintenanceId}`,
  });

  await notification.save();
  socket.emitNotification(notification);

  return res.status(200).json({
    success: true,
    message: "Maintenance updated successfully",
  });
};
