const Properties = require("../models/propertyModel");
const User = require("../models/userModel");
const Maintenance = require("../models/maintenanceModel");
const Apartment = require("../models/apartmentModel");
const Conversation = require("../models/ConversationModel");
const { USER_ROLES } = require("../constants");

exports.getClientDashboardData = async (req, res) => {
  try {
    const { role, client } = req;

    if (role !== USER_ROLES.CLIENT) return res.status(403).json({ success: false, message: "Unauthorized" });

    const totalProperties = await Properties.countDocuments({ client });
    const totalApartments = await Apartment.countDocuments({ client });
    const rentedApartments = await Apartment.countDocuments({ client, tenant: { $ne: null } });
    const freeApartments = totalApartments - rentedApartments;

    const totalMaintenances = await Maintenance.countDocuments({ client });
    const maintenanceInProgress = await Maintenance.countDocuments({ client, maintenanceStatus: "INPROGRESS" });
    const maintenanceCompleted = await Maintenance.countDocuments({ client, maintenanceStatus: "COMPLETED" });
    const maintenancePending = await Maintenance.countDocuments({ client, maintenanceStatus: "PENDING" });
    const maintenanceCancelled = await Maintenance.countDocuments({ client, maintenanceStatus: "CANCELLED" });

    const pendingPercentage = (maintenancePending / totalMaintenances) * 100;
    const inProgressPercentage = (maintenanceInProgress / totalMaintenances) * 100;
    const completedPercentage = (maintenanceCompleted / totalMaintenances) * 100;
    const cancelledPercentage = (maintenanceCancelled / totalMaintenances) * 100;

    res.status(200).json({
      success: true,
      totalProperties,
      totalApartments,
      rentedApartments,
      freeApartments,
      totalMaintenances,
      maintenanceInProgress,
      maintenanceCompleted,
      maintenancePending,
      maintenanceCancelled,
      pendingPercentage,
      inProgressPercentage,
      completedPercentage,
      cancelledPercentage,
    });
  } catch (error) {
    console.error("Error in getClientDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getManagerDashboardData = async (req, res) => {
  try {
    const { user } = req;
    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        properties: user.properties,
        subscription: user.subscription,
      },
    };
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getManagerDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
exports.getMaintainerDashboardData = async (req, res) => {
  try {
    const { user } = req;
    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        properties: user.properties,
        subscription: user.subscription,
      },
    };
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getMaintainerDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
exports.getJanitorDashboardData = async (req, res) => {
  try {
    let query = {
      client: req.client,
    };

    if (req.role === USER_ROLES.TENANT) {
      query.tenant = req.user.id;
    }

    if (req.role === USER_ROLES.MANAGER || req.role === USER_ROLES.MAINTAINER || req.role === USER_ROLES.JANITOR) {
      const staff = await User.findById(req.user.id);
      const properties = staff.properties;
      query.property = { $in: properties };
    }

    const conversations = await Conversation.find(query)
      .populate("property", "name")
      .populate("maintenance", "maintenanceType maintenanceDetails")
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 } },
        perDocumentLimit: 1,
      })
      .sort("-updatedAt");
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error("Error in getJanitorDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
exports.getTenantDashboardData = async (req, res) => {
  try {
    let query = {
      client: req.client,
    };

    if (req.role === USER_ROLES.TENANT) {
      query.tenant = req.user.id;
    }

    if (req.role === USER_ROLES.MANAGER || req.role === USER_ROLES.MAINTAINER || req.role === USER_ROLES.JANITOR) {
      const staff = await User.findById(req.user.id);
      const properties = staff.properties;
      query.property = { $in: properties };
    }

    const conversations = await Conversation.find(query)
      .populate("property", "name")
      .populate("maintenance", "maintenanceType maintenanceDetails")
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 } },
        perDocumentLimit: 1,
      })
      .sort("-updatedAt");
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error("Error in getTenantDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
