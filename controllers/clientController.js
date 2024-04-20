const User = require("../models/userModel");
const Company = require("../models/clientModel");
const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");

exports.getClients = async (req, res) => {
  const { query = "", page = 1 } = req.query;

  const totalClients = await User.countDocuments({
    role: USER_ROLES.CLIENT,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { clientId: { $regex: query, $options: "i" } },
    ],
  });

  const totalPages = Math.ceil(totalClients / 10);

  const clients = await User.find({
    role: USER_ROLES.CLIENT,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { companyId: { $regex: query, $options: "i" } },
    ],
  })
    .select("-_id -__v -createdAt -updatedAt -password -accessToken -refreshToken")
    .limit(10)
    .skip((page - 1) * 10)
    .sort({ createdAt: -1 })
    .populate("client", "-_id -createdAt -updatedAt -owner -__v");

  return res.status(200).json({
    success: true,
    currentPage: page,
    totalPages,
    clients,
  });
};

exports.getClient = async (req, res) => {
  const { id } = req.params;
  const client = await User.findOne({ userId: id, role: USER_ROLES.CLIENT })
    .select("-_id -__v -password -accessToken -refreshToken")
    .populate("client", "-__v -_id -createdAt -updatedAt")
    .populate("properties", "-_id name")
    .lean();
  return res.status(200).json({
    success: true,
    client,
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
  const company = await Company.findOne({ companyId: req.params.id }).populate("owner", "id");
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
