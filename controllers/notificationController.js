const Notification = require("../models/notificationModel");

exports.getNotifications = async (req, res) => {
  const { page = 1, limit = 5 } = req.query;

  const notifications = await Notification.find({ user: req.id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const countUnread = await Notification.countDocuments({ user: req.id, status: "unread" });

  return res.status(200).json({
    success: true,
    unread: countUnread,
    notifications,
  });
};

exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate({ notificationId, user: req.id }, { status: "read" }, { new: true });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Notification marked as read",
  });
};

exports.markAsUnread = async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate({ notificationId, user: req.id }, { status: "unread" }, { new: true });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Notification marked as unread",
  });
};
