const Properties = require("../models/propertyModel");
const User = require("../models/userModel");
const Maintenance = require("../models/maintenanceModel");
const Apartment = require("../models/apartmentModel");
const { USER_ROLES } = require("../constants");

exports.getClientDashboardData = async (req, res) => {
  try {
    const { role, userId, client } = req;

    if (role !== USER_ROLES.CLIENT) return res.status(403).json({ success: false, message: "Unauthorized" });

    const properties = await Properties.find({ client }).lean();
    const propertiesCount = properties.length;

    const PropertyCreatedSinceLastMonth = await Properties.find({
      client,
      createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
    }).lean();

    const propertyIncreasedPercent = ((PropertyCreatedSinceLastMonth.length / propertiesCount) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      propertiesCount,
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
    console.error("Error in getJanitorDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
exports.getTenantDashboardData = async (req, res) => {
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
    console.error("Error in getTenantDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
