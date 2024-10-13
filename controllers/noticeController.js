const Notice = require("../models/noticeModel");
const User = require("../models/userModel");
const { USER_ROLES } = require("../constants");

exports.createNotice = async (req, res) => {
  try {
    const { date, dateEvent, properties, title, body } = req.body;
    await Notice.create({
      client: req.client,
      date,
      dateEvent,
      properties,
      title,
      body,
    });
    res.status(201).json({ message: "Notice sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    await Notice.findOneAndUpdate({ noticeId }, { archived: true, archivedBy: req.id });
    res.status(200).json({ message: "Notice Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getNoticeList = async (req, res) => {
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

    const totalNotices = await Notice.find(query).countDocuments();
    const notices = await Notice.find(query)
      .populate("properties", "name")
      .limit(5)
      .skip(5 * (page - 1))
      .sort("-createdAt")
      .lean();
    res.status(200).json({ success: true, currentPage: page, totalPages: Math.ceil(totalNotices / 5), notices });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
