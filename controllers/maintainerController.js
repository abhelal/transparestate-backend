const User = require("../models/userModel");
const Property = require("../models/propertyModel");
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
      status: { $ne: USER_STATUS.DELETED },
    }).countDocuments();

    const maintainers = await User.find({
      role: USER_ROLES.MAINTAINER,
      company: user.company,
      status: { $ne: USER_STATUS.DELETED },
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

exports.getMaintainer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const maintainer = await User.findOne({ userId: id, company: user.company })
      .select("-_id -password -accessToken")
      .populate("company", "-_id name")
      .populate("properties", "_id name propertyId");

    if (!maintainer) {
      return res.status(404).json({
        message: "Maintainer not found",
      });
    }
    return res.status(200).json({ maintainer });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

    await Promise.all(
      properties.map(async (prop) => {
        const property = await Property.findById(prop);
        if (!property.maintainers.includes(maintainer._id)) {
          property.maintainers.push(maintainer._id);
          await property.save();
        }
      })
    );

    return res.status(201).json({ message: "Maintainer created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMaintainerInfo = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const schema = Joi.object({
      name: Joi.string().required().min(3),
      email: Joi.string().email().required(),
      contactNumber: Joi.string().required().min(3),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    const { email, name, contactNumber } = value;
    const maintainer = await User.findOne({ userId: id, company: user.company });

    if (!maintainer) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    maintainer.name = name;
    maintainer.email = email;
    maintainer.contactNumber = contactNumber;

    await maintainer.save();
    return res.status(201).json({ message: "Maintainer updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMaintainerPassword = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const schema = Joi.object({
      password: Joi.string().required(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    const { password } = value;
    const maintainer = await User.findOne({ userId: id, company: user.company });

    if (!maintainer) {
      return res.status(409).json({
        success: false,
        message: "Maintainer not found",
      });
    }

    maintainer.password = password;

    await maintainer.save();
    return res.status(201).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMaintainerProperties = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }

    const schema = Joi.object({
      properties: Joi.array().items(Joi.string()),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    const { properties } = value;
    const maintainer = await User.findOne({ userId: id, company: user.company });

    if (!maintainer) {
      return res.status(409).json({
        success: false,
        message: "Maintainer not found",
      });
    }

    maintainer.properties = properties;
    await maintainer.save();

    await Promise.all(
      properties.map(async (prop) => {
        const property = await Property.findById(prop);
        if (!property.maintainers.includes(maintainer._id)) {
          property.maintainers.push(maintainer._id);
          await property.save();
        }
      })
    );

    return res.status(201).json({ message: "Properties updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMaintainerStatus = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const schema = Joi.object({
      status: Joi.string().valid(USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.DELETED),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    const { status } = value;
    const maintainer = await User.findOne({ userId: id, company: user.company });

    if (!maintainer) {
      return res.status(409).json({
        success: false,
        message: "Maintainer not found",
      });
    }

    maintainer.status = status;

    await maintainer.save();
    return res.status(201).json({
      message:
        status === "ACTIVE"
          ? "Maintainer Activated successfully"
          : "Maintainer Deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteMaintainer = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const maintainer = await User.findOne({ userId: id, company: user.company });

    if (!maintainer) {
      return res.status(409).json({
        success: false,
        message: "Maintainer not found",
      });
    }

    maintainer.status = USER_STATUS.DELETED;
    await maintainer.save();

    return res.status(201).json({ message: "Maintainer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
