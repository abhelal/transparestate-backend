const Provider = require("../models/providerModel");
const User = require("../models/userModel");
const Joi = require("joi");
const { SERVICE_TYPES, USER_ROLES } = require("../constants");

exports.updateServices = async (req, res) => {
  const schema = Joi.object({
    services: Joi.array()
      .items(Joi.string().valid(...Object.keys(SERVICE_TYPES)))
      .required(),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(409).json({
      success: false,
      message: error.details.map((err) => err.message),
    });
  }

  const { services } = value;

  const provider = await Provider.findOne({ userId: req.userId });

  provider.services = services;

  await provider.save();

  return res.status(200).json({
    success: true,
    message: "Services updated successfully",
  });
};

exports.getProviders = async (req, res) => {
  const { query, page } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const providers = await User.find({
    role: USER_ROLES.PROVIDER,
    $or: [{ name: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }],
  })
    .select("name contactNumber email status")
    .populate("provider", "-_id providerId services")
    .limit(limit)
    .skip(skip);

  const totalPages = Math.ceil((await Provider.countDocuments()) / limit);

  return res.status(200).json({
    success: true,
    providers,
    totalPages,
  });
};
