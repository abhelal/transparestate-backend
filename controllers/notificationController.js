const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const { USER_ROLES } = require("../constants");

exports.createNotification = async (req, res) => {
  try {
    const { date, dateEvent, properties, title, body } = req.body;
    await Notification.create({
      client: req.client,
      date,
      dateEvent,
      properties,
      title,
      body,
    });
    res.status(201).json({ message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndUpdate({ notificationId }, { archived: true, archivedBy: req.id });
    res.status(200).json({ message: "Notification Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getNotificationList = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const user = await User.findOne({ userId: req.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let query = {
      client: user.client,
      archived: false,
    };

    if (user.role === USER_ROLES.MAINTAINER || user.role === USER_ROLES.JANITOR) {
      query.properties = { $in: user.properties };
    }

    const totalNotifications = await Notification.find(query).countDocuments();
    const notifications = await Notification.find(query)
      .populate("properties", "name")
      .limit(5)
      .skip(5 * (page - 1))
      .sort("-createdAt")
      .lean();
    res.status(200).json({ success: true, currentPage: page, totalPages: Math.ceil(totalNotifications / 5), notifications });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
