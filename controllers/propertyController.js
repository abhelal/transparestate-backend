const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const Joi = require("joi");

// create Property

exports.createProperty = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a property",
      });
    }

    const schema = Joi.object({
      propertyType: Joi.string().required(),
      name: Joi.string().required(),
      street: Joi.string().required(),
      buildingNo: Joi.string().required(),
      zipCode: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((error) => error.message),
      });
    }
    const property = await Property.create({ ...value, company: user.company });
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// get all properties

exports.getProperties = async (req, res) => {
  try {
    const { query = "", page = 1 } = req.query;
    const user = await User.findOne({ userId: req.userId });

    if (!user) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }
    const totaProperties = await Property.find({ company: user.company }).countDocuments();

    const properties = await Property.find({
      company: user.company,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { propertyId: { $regex: query, $options: "i" } },
      ],
    })
      .limit(10)
      .skip(10 * (page - 1))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totaProperties / 10),
      properties,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const property = await Property.findOne({ propertyId: id, company: user.company });
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }
    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
