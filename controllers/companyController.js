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
      const company = new Company({
        name,
        address,
        contactNumber,
        country,
        owner: user.id,
      });

      await company.save();

      if (!company.id) {
        await User.deleteOne({ id: user.id });
      }

      return res.status(200).json({
        success: true,
        message: "Company created successfully",
      });
    }
  }
};
