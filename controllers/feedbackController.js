const { USER_ROLES } = require("../constants");
const Feedback = require("../models/feedbackModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const socket = require("../socket");

exports.create = async (req, res) => {
  try {
    const { message, star = 0 } = req.body;
    const feedback = await Feedback.create({ feedbackBy: req.id, message, star });
    const superadmin = await User.findOne({ role: USER_ROLES.SUPERADMIN });

    const notification = new Notification({
      user: superadmin._id,
      message: "Received a new feedback",
      href: `/feedbacks/${feedback.feedbackId}`,
    });

    await notification.save();
    socket.emitNotification(notification);

    res.status(201).json({
      status: "success",
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const sort = req.query.sort || "createdAt";

    const feedbacks = await Feedback.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sort]: -1 })
      .populate("feedbackBy", "name role email");

    const totalFeedbacks = await Feedback.countDocuments();
    const totalPages = Math.ceil(totalFeedbacks / limit);

    res.status(200).json({
      status: "success",
      feedbacks,
      totalFeedbacks,
      totalPages,
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ feedbackId: req.params.id }).populate("feedbackBy", "name email");
    res.status(200).json({ status: "success", feedback });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { message, star = 0 } = req.body;
    await Feedback.findByIdAndUpdate(req.params.id, { message, star });
    res.status(200).json({ status: "success", message: "Feedback updated successfully" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
