const User = require("../models/userModel");
const Property = require("../models/propertyModel");
const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");

exports.createJanitor = async (req, res) => {
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
        message: "Janitor email already exists",
      });
    }

    const janitor = new User({
      name,
      email,
      password,
      contactNumber,
      properties,
      role: USER_ROLES.JANITOR,
      status: USER_STATUS.ACTIVE,
      client: user.client,
    });

    await janitor.save();

    await Promise.all(
      properties.map(async (prop) => {
        const property = await Property.findById(prop);
        if (!property.janitors.includes(janitor._id)) {
          property.janitors.push(janitor._id);
          await property.save();
        }
      })
    );

    return res.status(201).json({ message: "Janitor created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getJanitors = async (req, res) => {
  try {
    const { query = "", page = 1 } = req.query;
    const user = await User.findOne({ userId: req.userId });

    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }

    const totalJanitors = await User.find({
      role: USER_ROLES.JANITOR,
      client: user.client,
      status: { $ne: USER_STATUS.DELETED },
    }).countDocuments();

    const janitors = await User.find({
      role: USER_ROLES.JANITOR,
      client: user.client,
      status: { $ne: USER_STATUS.DELETED },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { userId: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("-_id -password -accessToken")
      .populate("client")
      .populate("properties", "-_id name propertyId")
      .limit(10)
      .skip(10 * (page - 1))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalJanitors / 10),
      janitors,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJanitor = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const janitor = await User.findOne({
      userId: id,
      client: user.client,
      role: USER_ROLES.JANITOR,
    })
      .select("-_id -password -accessToken")
      .populate("client")
      .populate("properties", "_id name propertyId");

    if (!janitor) {
      return res.status(404).json({
        message: "Janitor not found",
      });
    }
    return res.status(200).json({ janitor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateJanitorInfo = async (req, res) => {
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
    const maintainer = await User.findOne({ userId: id, client: user.client });

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
    return res.status(201).json({ message: "Janitor updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateJanitorPassword = async (req, res) => {
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
        message: "Janitor not found",
      });
    }

    maintainer.password = password;

    await maintainer.save();
    return res.status(201).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateJanitorProperties = async (req, res) => {
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
        message: "Janitor not found",
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

exports.updateJanitorStatus = async (req, res) => {
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
        message: "Janitor not found",
      });
    }

    maintainer.status = status;

    await maintainer.save();
    return res.status(201).json({
      message:
        status === "ACTIVE" ? "Janitor Activated successfully" : "Janitor Deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteJanitor = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const maintainer = await User.findOne({ userId: id, client: user.client });

    if (!maintainer) {
      return res.status(409).json({
        success: false,
        message: "Janitor not found",
      });
    }

    maintainer.status = USER_STATUS.DELETED;

    await maintainer.save();
    return res.status(201).json({ message: "Janitor deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
