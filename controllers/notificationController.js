const Notification = require("../models/notificationModel");

exports.createNotification = async (req, res) => {
  try {
    const { date, properties, title, body } = req.body;
    await Notification.create({
      client: req.client,
      date,
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
    const totalNotifications = await Notification.find({ client: req.client, archived: false }).countDocuments();
    const notifications = await Notification.find({ client: req.client, archived: false })
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
