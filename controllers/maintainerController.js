const User = require("../models/userModel");
const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");

exports.getMaintainers = async (req, res) => {
  try {
    const { query = "", page = 1 } = req.query;
    const user = await User.findOne({ userId: req.userId });

    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }

    const totalMaintainers = await User.find({
      role: USER_ROLES.MAINTAINER,
      company: user.company,
    }).countDocuments();

    const maintainers = await User.find({
      role: USER_ROLES.MAINTAINER,
      company: user.company,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { userId: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("-_id -password -accessToken")
      .populate("company", "-_id name")
      .populate("properties", "-_id name propertyId")
      .limit(10)
      .skip(10 * (page - 1))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalMaintainers / 10),
      maintainers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaintainer = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const schema = Joi.object({
      name: Joi.string().required().min(3),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      contactNumber: Joi.string().required().min(3),
      properties: Joi.array().items(Joi.string()),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    const { email, password, name, contactNumber, properties } = value;

    const isExists = await User.findOne({ email: email }).lean();
    if (isExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const maintainer = new User({
      name,
      email,
      password,
      contactNumber,
      properties,
      role: USER_ROLES.MAINTAINER,
      status: USER_STATUS.ACTIVE,
      company: user.company,
    });

    await maintainer.save();
    return res.status(201).json({ message: "Maintainer created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
