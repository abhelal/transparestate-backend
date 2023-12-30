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
      const user = await newUser.save();
      return res.status(200).json({
        success: true,
        message: "Tenants created successfully",
      });
    }
  }
};
