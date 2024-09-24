const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Properties = require("../models/propertyModel");
const User = require("../models/userModel");
const Maintenance = require("../models/maintenanceModel");
const Apartment = require("../models/apartmentModel");
const Conversation = require("../models/conversationModel");
const { USER_ROLES } = require("../constants");

exports.getClientDashboardData = async (req, res) => {
  try {
    const { client } = req;

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

    // const lastSixMonthMaintenance = [
    //   { month: "January", request: 100, complete: 80 },
    //   { month: "February", request: 200, complete: 150 },
    //   { month: "March", request: 300, complete: 250 },
    //   { month: "April", request: 700, complete: 350 },
    //   { month: "May", request: 500, complete: 450 },
    //   { month: "June", request: 600, complete: 550 },
    //   { month: "July", request: 400, complete: 350 },
    //   { month: "August", request: 800, complete: 750 },
    //   { month: "September", request: 900, complete: 850 },
    //   { month: "October", request: 1000, complete: 950 },
    //   { month: "November", request: 600, complete: 550 },
    //   { month: "December", request: 800, complete: 750 },
    // ];

    const maintenanceRequestAndComplete = await Maintenance.aggregate([
      {
        $match: {
          client: new ObjectId(client),
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          request: { $sum: 1 },
          complete: {
            $sum: {
              $cond: [{ $eq: ["$maintenanceStatus", "COMPLETED"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          month: "$_id",
          request: 1,
          complete: 1,
          _id: 0,
        },
      },
      {
        $limit: 6,
      },
    ]).exec();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const mrvsc = maintenanceRequestAndComplete.map((item) => ({ ...item, month: monthNames[item.month - 1] }));

    return res.status(200).json({
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
      maintenanceRequestAndComplete: mrvsc,
    });
  } catch (error) {
    console.error("Error in getClientDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getMaintainerDashboardData = async (req, res) => {
  try {
    const { client, userId } = req;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const totalProperties = user.properties.length;
    const totalApartments = await Apartment.countDocuments({ client, property: { $in: user.properties } });
    const rentedApartments = await Apartment.countDocuments({ client, property: { $in: user.properties }, tenant: { $ne: null } });
    const freeApartments = totalApartments - rentedApartments;

    const totalMaintenances = await Maintenance.countDocuments({ client, property: { $in: user.properties } });
    const maintenanceInProgress = await Maintenance.countDocuments({
      client,
      property: { $in: user.properties },
      maintenanceStatus: "INPROGRESS",
    });
    const maintenanceCompleted = await Maintenance.countDocuments({
      client,
      property: { $in: user.properties },
      maintenanceStatus: "COMPLETED",
    });
    const maintenancePending = await Maintenance.countDocuments({
      client,
      property: { $in: user.properties },
      maintenanceStatus: "PENDING",
    });
    const maintenanceCancelled = await Maintenance.countDocuments({
      client,
      property: { $in: user.properties },
      maintenanceStatus: "CANCELLED",
    });

    const pendingPercentage = (maintenancePending / totalMaintenances) * 100;
    const inProgressPercentage = (maintenanceInProgress / totalMaintenances) * 100;
    const completedPercentage = (maintenanceCompleted / totalMaintenances) * 100;
    const cancelledPercentage = (maintenanceCancelled / totalMaintenances) * 100;

    return res.status(200).json({
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
