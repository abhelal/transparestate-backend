const Properties = require("../models/propertyModel");
const User = require("../models/userModel");
const Maintenance = require("../models/maintenanceModel");
const Apartment = require("../models/apartmentModel");
const Conversation = require("../models/conversationModel");
const Client = require("../models/clientModel");
const SubscriptionBill = require("../models/subscriptionBill");

const { USER_ROLES } = require("../constants");

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

exports.getClientDashboardData = async (req, res) => {
  try {
    const { client, userId } = req;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

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

    const maintenanceRequestAndComplete = await Maintenance.aggregate([
      {
        $match: { client: { $eq: user.client } },
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

exports.getDashboardData = async (req, res) => {
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

    const maintenanceRequestAndComplete = await Maintenance.aggregate([
      {
        $match: { property: { $in: user.properties } },
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
    console.error("Error in getMaintainerDashboardData:", error);
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

exports.getSuperAdminDashboardData = async (req, res) => {
  try {
    // total client and subsctibed client
    const totalClients = await Client.countDocuments({});
    const subscribedClients = await Client.countDocuments({ isSubscribed: true });

    // total subscription bill amount and this month subscription bill amount
    const totalBillAmount = await SubscriptionBill.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const thisMonthBillAmount = await SubscriptionBill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    // last six mond subscribed vs total client , monthwise data .

    const subscribedVsTotalClient = await Client.aggregate([
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          total: { $sum: 1 },
          subscribed: {
            $sum: {
              $cond: [{ $eq: ["$isSubscribed", true] }, 1, 0],
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
          total: 1,
          subscribed: 1,
          _id: 0,
        },
      },
      {
        $limit: 6,
      },
    ]).exec();

    const stc = subscribedVsTotalClient.map((item) => ({ ...item, month: monthNames[item.month - 1] }));

    return res.status(200).json({
      totalClients,
      subscribedClients,
      totalBillAmount: totalBillAmount.length ? totalBillAmount[0].totalAmount : 0,
      thisMonthBillAmount: thisMonthBillAmount.length ? thisMonthBillAmount[0].totalAmount : 0,
      subscribedVsTotalClient: stc,
    });
  } catch (error) {
    console.error("Error in getSuperAdminDashboardData:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
