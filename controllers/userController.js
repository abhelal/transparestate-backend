const User = require("../models/userModel");
const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");

// create new tenants

exports.createTenants = async (req, res) => {
  const schema = Joi.object({
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
    const { email, password } = value;
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
        role: USER_ROLES.TENANTS,
        status: USER_STATUS.ACTIVE,
      });
      await newUser.save();
      return res.status(200).json({
        success: true,
        message: "Tenants created successfully",
      });
    }
  }
};

exports.getUsers = async (req, res) => {
  const { query = "", page = 1 } = req.query;
  const totalUsers = await User.countDocuments({
    email: { $regex: query, $options: "i" },
  });

  const totalPages = Math.ceil(totalUsers / 10);

  const users = await User.find({
    email: { $regex: query, $options: "i" },
  })
    .skip((page - 1) * 10)
    .limit(10)
    .select("-_id -password -__v -createdAt -updatedAt")
    .lean();
  return res.status(200).json({
    success: true,
    page,
    totalPages,
    users,
  });
};

exports.getUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ userId })
    .select("-_id -password -__v -createdAt -updatedAt")
    .lean();
  return res.status(200).json({
    success: true,
    user,
  });
};
