const User = require("../models/userModel");
const Property = require("../models/propertyModel");
const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");

exports.createManager = async (req, res) => {
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
        message: "Manager email already exists",
      });
    }

    const manager = new User({
      name,
      email,
      password,
      contactNumber,
      properties,
      role: USER_ROLES.MANAGER,
      status: USER_STATUS.ACTIVE,
      client: user.client,
    });

    await manager.save();

    await Promise.all(
      properties.map(async (prop) => {
        const property = await Property.findById(prop);
        if (!property.manager.includes(manager._id)) {
          property.manager.push(manager._id);
          await property.save();
        }
      })
    );

    return res.status(201).json({ message: "Manager created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getManagers = async (req, res) => {
  try {
    const { query = "", page = 1 } = req.query;
    const user = await User.findOne({ userId: req.userId });

    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }

    const totalManager = await User.find({
      role: USER_ROLES.MANAGER,
      client: user.client,
      status: { $ne: USER_STATUS.DELETED },
    }).countDocuments();

    const managers = await User.find({
      role: USER_ROLES.MANAGER,
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
      totalPages: Math.ceil(totalManager / 10),
      managers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getManager = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const manager = await User.findOne({
      userId: id,
      client: user.client,
      role: USER_ROLES.MANAGER,
    })
      .select("-_id -password -accessToken")
      .populate("client")
      .populate("properties", "_id name propertyId");

    if (!manager) {
      return res.status(404).json({
        message: "Manager not found",
      });
    }
    return res.status(200).json({ manager });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateManagerInfo = async (req, res) => {
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

    const manager = await User.findOne({
      userId: id,
      client: user.client,
      role: USER_ROLES.MANAGER,
    });

    if (!manager) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    manager.name = name;
    manager.email = email;
    manager.contactNumber = contactNumber;

    await manager.save();
    return res.status(201).json({ message: "Manager updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateManagerPassword = async (req, res) => {
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
    const manager = await User.findOne({ userId: id, client: user.client });

    if (!manager) {
      return res.status(409).json({
        success: false,
        message: "Janitor not found",
      });
    }

    manager.password = password;

    await manager.save();
    return res.status(201).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateManagerProperties = async (req, res) => {
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
    const manager = await User.findOne({
      userId: id,
      client: user.client,
      role: USER_ROLES.MANAGER,
    });

    if (!manager) {
      return res.status(409).json({
        success: false,
        message: "Janitor not found",
      });
    }

    manager.properties = properties;
    await manager.save();

    await Promise.all(
      properties.map(async (prop) => {
        const property = await Property.findById(prop);
        if (!property.managers.includes(manager._id)) {
          property.managers.push(manager._id);
          await property.save();
        }
      })
    );

    return res.status(201).json({ message: "Properties updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateManagerStatus = async (req, res) => {
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
    const manager = await User.findOne({
      userId: id,
      client: user.client,
      role: USER_ROLES.MANAGER,
    });

    if (!manager) {
      return res.status(409).json({
        success: false,
        message: "Manager not found",
      });
    }

    manager.status = status;

    await manager.save();
    return res.status(201).json({
      message:
        status === "ACTIVE" ? "Janitor Activated successfully" : "Janitor Deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteManager = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const manager = await User.findOne({
      userId: id,
      client: user.client,
      role: USER_ROLES.MANAGER,
    });

    if (!manager) {
      return res.status(409).json({
        success: false,
        message: "Manager not found",
      });
    }

    manager.status = USER_STATUS.DELETED;
    await manager.save();
    return res.status(201).json({ message: "Manager deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
