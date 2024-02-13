const User = require("../models/userModel");
const Company = require("../models/comapnyModel");
const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");

exports.createCompany = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3),
    address: Joi.string().required().min(3),
    contactNumber: Joi.string().required().min(3),
    country: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(409).json({
      success: false,
      message: error.details.map((err) => err.message),
    });
  } else {
    const { email, password, name, address, contactNumber, country } = value;
    const isExists = await User.findOne({ email: email }).lean();
    if (isExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    } else {
      const newUser = new User({
        email: email,
        password: password,
        role: USER_ROLES.OWNER,
        status: USER_STATUS.ACTIVE,
      });
      const user = await newUser.save();
      try {
        const company = new Company({
          name,
          address,
          contactNumber,
          country,
          owner: user.id,
        });
        await company.save();
        user.company = company.id;
        await user.save();
      } catch (error) {
        await User.findByIdAndDelete(user.id);
        return res.status(409).json({
          success: false,
          message: "Company creation failed",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Company created successfully",
      });
    }
  }
};

exports.getCompanies = async (req, res) => {
  const { query = "", page = 1 } = req.query;

  const totalCompanies = await Company.countDocuments({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { companyId: { $regex: query, $options: "i" } },
    ],
  });

  const totalPages = Math.ceil(totalCompanies / 10);

  const companies = await Company.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { companyId: { $regex: query, $options: "i" } },
    ],
  })
    .select("-_id -__v -createdAt -updatedAt")
    .limit(10)
    .skip((page - 1) * 10)
    .sort({ createdAt: -1 })
    .populate("owner", "email");

  return res.status(200).json({
    success: true,
    currentPage: page,
    totalPages,
    companies,
  });
};

exports.getCompany = async (req, res) => {
  const { id } = req.params;
  const company = await Company.findOne({ companyId: id })
    .select("-_id -__v -createdAt -updatedAt")
    .populate("owner", "-_id email");
  return res.status(200).json({
    success: true,
    company,
  });
};

exports.updateCompany = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3),
    address: Joi.string().required().min(3),
    contactNumber: Joi.string().required().min(3),
    country: Joi.string().required(),
    email: Joi.string().email().required(),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(409).json({
      success: false,
      message: error.details.map((err) => err.message),
    });
  } else {
    const { email, name, address, contactNumber, country } = value;
    const company = await Company.findOne({
      companyId: req.params.id,
    }).populate("owner", "id");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    } else {
      try {
        const user = await User.findById(company.owner.id);
        if (user.email !== email) {
          const isExists = await User.findOne({ email: email }).lean();
          if (isExists) {
            return res.status(409).json({
              success: false,
              message: "Email already exists",
            });
          }
          user.email = email;
          user.accessToken = [];
          user.refreshToken = [];
        }
        if (req.body.password) {
          user.password = req.body.password;
          user.accessToken = [];
          user.refreshToken = [];
        }
        await user.save();

        await Company.updateOne(
          { companyId: req.params.id },
          {
            name,
            address,
            contactNumber,
            country,
          }
        );
      } catch (error) {
        console.log(error);
        return res.status(409).json({
          success: false,
          message: "Company update failed",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Company updated successfully",
      });
    }
  }
};

exports.archiveCompany = async (req, res) => {
  const company = await Company.findOne({ companyId: req.params.id }).populate(
    "owner",
    "id"
  );
  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  } else {
    try {
      await Company.updateOne(
        { companyId: req.params.id },
        {
          archived: !company.archived,
        }
      );
    } catch (error) {
      return res.status(409).json({
        success: false,
        message: "Company archiving failed",
      });
    }
    return res.status(200).json({
      success: true,
      message: company.archived
        ? "Company unarchived successfully"
        : "Company archived successfully",
    });
  }
};
