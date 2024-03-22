const User = require("../models/userModel");
const Tenant = require("../models/tenantsModel");

const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");

exports.getTenants = async (req, res) => {
  try {
    const { query = "", page = 1 } = req.query;
    const user = await User.findOne({ userId: req.userId });

    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view tenants",
      });
    }

    let queryTotal = {
      role: USER_ROLES.TENANT,
      company: user.company,
      status: { $ne: USER_STATUS.DELETED },
    };

    let queryTenants = {
      role: USER_ROLES.TENANT,
      company: user.company,
      status: { $ne: USER_STATUS.DELETED },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { userId: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    };

    if (user.role === USER_ROLES.MAINTAINER) {
      queryTotal.properties = { $in: user.properties };
      queryTenants.properties = { $in: user.properties };
    }

    const totalTenant = await User.find(queryTotal).countDocuments();

    const tenants = await User.find(queryTenants)
      .select("-_id -password -accessToken")
      .populate("properties", "-_id name propertyId")
      .populate("tenant", "-_id -createdAt -updatedAt")
      .limit(10)
      .skip(10 * (page - 1))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalTenant / 10),
      totalTenant,
      tenants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTenant = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to create tenants",
      });
    }
    const schema = Joi.object({
      name: Joi.string().required().min(3),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      contactNumber: Joi.string().required().min(3),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    const { email, password, name, contactNumber } = value;

    const isExists = await User.findOne({ email: email }).lean();

    if (isExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const tenant = new User({
      name,
      email,
      password,
      contactNumber,
      role: USER_ROLES.TENANT,
      status: USER_STATUS.ACTIVE,
      company: user.company,
    });

    await tenant.save();
    return res.status(201).json({ message: "Tenant created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateTenantInfo = async (req, res) => {
  try {
    const id = req.params.id;
    const requester = await User.findOne({ userId: req.userId });

    if (!requester) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const userSchema = Joi.object({
      name: Joi.string().required().min(3),
      email: Joi.string().email().required(),
      contactNumber: Joi.string().required().min(3),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = userSchema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    const { email, name, contactNumber } = value;
    const user = await User.findOne({ userId: id, company: requester.company });

    if (!user) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    user.name = name;
    user.email = email;
    user.contactNumber = contactNumber;

    const tenantSchema = Joi.object({
      birthDate: Joi.string(),
      job: Joi.string(),
      familyMember: Joi.number(),
      permAddress: Joi.string(),
      permCountry: Joi.string(),
      permCity: Joi.string(),
      permZipCode: Joi.string(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error: tenantError, value: tenantValue } = tenantSchema.validate(req.body);

    if (tenantError) {
      return res.status(409).json({
        success: false,
        message: tenantError.details.map((err) => err.message),
      });
    }

    const { birthDate, job, familyMember, permAddress, permCountry, permCity, permZipCode } =
      tenantValue;

    let tenant = await Tenant.findById(user.tenant);
    if (!tenant) {
      tenant = new Tenant({
        birthDate,
        job,
        familyMember,
        permAddress,
        permCountry,
        permCity,
        permZipCode,
      });
      await tenant.save();
      user.tenant = tenant._id;
    } else {
      tenant.birthDate = birthDate;
      tenant.job = job;
      tenant.familyMember = familyMember;
      tenant.permAddress = permAddress;
      tenant.permCountry = permCountry;
      tenant.permCity = permCity;
      tenant.permZipCode = permZipCode;
      await tenant.save();
    }

    await user.save();
    return res.status(201).json({ message: "Tenant updated successfully" });
  } catch (error) {
    console.log(error);
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

exports.getTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });

    const tenant = await User.findOne({ userId: id, company: user.company })
      .select("-_id -password -accessToken")
      .populate("properties", "-_id name propertyId")
      .populate("tenant", "-_id -createdAt -updatedAt");

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }
    return res.status(200).json({ tenant });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
