const User = require("../models/userModel");
const Tenants = require("../models/tenantsModel");
const Apartment = require("../models/apartmentModel");

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
      .populate("apartments", "-createdAt -updatedAt")
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

exports.getTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });

    const tenant = await User.findOne({
      userId: id,
      role: USER_ROLES.TENANT,
      company: user.company,
    })
      .select("-_id -password -accessToken")
      .populate("properties", "name propertyId")
      .populate("apartments", "-createdAt -updatedAt")
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

exports.createTenant = async (req, res) => {
  try {
    const requester = await User.findOne({ userId: req.userId });
    if (!requester) {
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

    const tenant = await Tenants.create({});

    const user = new User({
      name,
      email,
      password,
      contactNumber,
      role: USER_ROLES.TENANT,
      status: USER_STATUS.ACTIVE,
      client: requester.client,
      tenant: tenant._id,
    });

    await user.save();

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
    const tenant = await User.findOne({
      userId: id,
      role: USER_ROLES.TENANT,
      company: requester.company,
    });

    if (!tenant) {
      return res.status(409).json({
        success: false,
        message: "Tenant not found",
      });
    }

    tenant.name = name;
    tenant.email = email;
    tenant.contactNumber = contactNumber;

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

    await Tenants.findByIdAndUpdate(
      tenant.tenant,
      {
        birthDate,
        job,
        familyMember,
        permAddress,
        permCountry,
        permCity,
        permZipCode,
      },
      { upsert: true }
    );

    await tenant.save();
    return res.status(201).json({ message: "Tenant updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateTenantHome = async (req, res) => {
  try {
    const id = req.params.id;
    const requester = await User.findOne({ userId: req.userId });

    if (!requester) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }

    const schema = Joi.object({
      properties: Joi.array().items(Joi.object().keys({ _id: Joi.string().required() })),
      apartment: Joi.object().keys({
        _id: Joi.string().required(),
        apartmentId: Joi.string().required(),
      }),
      leaseStartDate: Joi.string().required(),
      leaseEndDate: Joi.string().required(),
      rent: Joi.number().required(),
      deposit: Joi.number().required(),
      lateFee: Joi.number().required(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }

    const { properties, apartment, leaseStartDate, leaseEndDate, rent, deposit, lateFee } = value;

    const tenant = await User.findOne({ userId: id, client: requester.client });

    if (!tenant) {
      return res.status(409).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const apartmentData = await Apartment.findOne({ apartmentId: apartment.apartmentId });

    if (!apartmentData) {
      return res.status(409).json({
        success: false,
        message: "Apartment not found",
      });
    }

    const oldApartment = await Apartment.findById(tenant.apartments[0]);

    if (oldApartment) {
      oldApartment.tenant = null;
      await oldApartment.save();
    }

    tenant.properties = properties.map((prop) => prop._id);
    tenant.apartments = [apartmentData._id];
    apartmentData.tenant = tenant._id;
    apartmentData.leaseStartDate = leaseStartDate;
    apartmentData.leaseEndDate = leaseEndDate;
    apartmentData.rent = rent;
    apartmentData.deposit = deposit;
    apartmentData.lateFee = lateFee;

    await apartmentData.save();
    await tenant.save();
    return res.status(201).json({ message: "Tenant home updated successfully" });
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
