const Property = require("../models/propertyModel");
const Apartment = require("../models/apartmentModel");
const User = require("../models/userModel");
const Joi = require("joi");
const { USER_ROLES } = require("../constants");
const client = require("../config/redis");

// create Property

exports.createProperty = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });

    if (!user || user.role !== USER_ROLES.CLIENT || user.status !== "ACTIVE") {
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

    const propertyExists = await Property.findOne({
      name: { $regex: new RegExp(`^${value.name}$`, "i") },
      client: user.client,
    });

    if (propertyExists) {
      return res.status(400).json({
        success: false,
        message: "Property with that name already exists",
      });
    }

    const property = await Property.create({ ...value, client: user.client });
    user.properties.push(property._id);
    await user.save();
    res.status(201).json({
      success: true,
      message: "Property created successfully",
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
    const requester = await User.findOne({ userId: req.userId });

    if (!requester) {
      return res.status(403).json({
        message: "You are not authorized to view properties",
      });
    }

    let totalQuery = { company: requester.company };

    let findQuery = {
      company: requester.company,
      $or: [{ name: { $regex: query, $options: "i" } }, { propertyId: { $regex: query, $options: "i" } }],
    };

    if (requester.role !== "ADMIN") {
      totalQuery._id = { $in: requester.properties };
      findQuery._id = { $in: requester.properties };
    }

    const totaProperties = await Property.find(totalQuery).countDocuments();
    const properties = await Property.find(findQuery)
      .limit(10)
      .skip(10 * (page - 1))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totaProperties / 10),
      totaProperties,
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
    const property = await Property.findOne({ propertyId: id, client: req.client })
      .populate("managers", "name email")
      .populate("maintainers", "name email")
      .populate("janitors", "name email")
      .populate({
        path: "apartments",
        select: "apartmentId floor door size rooms tenant archived",
        populate: {
          path: "tenant",
          select: "name email",
        },
      })
      .lean();

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

// update property

exports.updateProperty = async (req, res) => {
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

    if (value.name.toLowerCase() !== property.name.toLowerCase()) {
      const propertyExists = await Property.findOne({
        name: { $regex: new RegExp(`^${value.name}$`, "i") },
        company: user.company,
      });
      if (propertyExists) {
        return res.status(400).json({
          success: false,
          message: "Property with that name already exists",
        });
      }
    }
    const updatedProperty = await Property.findOneAndUpdate({ propertyId: id, company: user.company }, value, { new: true });
    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      updatedProperty,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// archive property

exports.archiveProperty = async (req, res) => {
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

    await Property.updateOne({ propertyId: id, company: user.company }, { archived: !property.archived });

    res.status(200).json({
      success: true,
      message: `Property ${property.archived ? "unarchived" : "archived"} successfully`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateAmenities = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const property = await Property.findOne({ propertyId: id, client: user.client });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const schema = Joi.object({
      amenities: Joi.array().items(Joi.string()).required(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((error) => error.message),
      });
    }

    const updatedProperty = await Property.findOneAndUpdate(
      { propertyId: id, client: user.client },
      { amenities: value.amenities },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Amenities updated successfully",
      updatedProperty,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateUtilities = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const property = await Property.findOne({ propertyId: id, client: user.client });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const schema = Joi.object({
      utilities: Joi.array().items(Joi.string()).required(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((error) => error.message),
      });
    }

    const updatedProperty = await Property.findOneAndUpdate(
      { propertyId: id, client: user.client },
      { utilities: value.utilities },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Utilities updated successfully",
      updatedProperty,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.allowPets = async (req, res) => {
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

    await Property.updateOne({ propertyId: id, company: user.company }, { allowPets: !property.allowPets });

    res.status(200).json({
      success: true,
      message: `Pets ${property.allowPets ? "not allowed" : "allowed"} updated successfully`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// create apartment

exports.createApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const property = await Property.findOne({ propertyId: id, client: user.client });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const schema = Joi.object({
      floor: Joi.number().required(),
      door: Joi.string().required().uppercase(),
      size: Joi.number().required(),
      rooms: Joi.number().required(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((error) => error.message),
      });
    }

    const apartmentExists = await Apartment.findOne({
      property: property._id,
      floor: value.floor,
      door: { $regex: new RegExp(`^${value.door}$`, "i") },
    });

    if (apartmentExists) {
      return res.status(400).json({
        success: false,
        message: `Apartment ${value.floor}-${value.door.toUpperCase()} already exists in this property`,
      });
    }

    const apartment = await Apartment.create({
      ...value,
      property: property._id,
      client: user.client,
    });
    property.apartments.push(apartment._id);
    await property.save();

    res.status(201).json({
      success: true,
      message: "Apartment created successfully",
      apartment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getApartments = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findOne({ propertyId, client: req.client }).populate("apartments").lean();
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
    }

    res.status(200).json({
      success: true,
      apartments: property.apartments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getApartment = async (req, res) => {
  try {
    const { propertyId, apartmentId } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const property = await Property.findOne({ propertyId, client: user.client });

    const apartment = await Apartment.findOne({ apartmentId, property: property._id })
      .populate("property", "-apartments")
      .populate("tenant", "-_id name email userId")
      .lean();

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
    }

    res.status(200).json({
      success: true,
      apartment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateApartment = async (req, res) => {
  try {
    const { propertyId, apartmentId } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const property = await Property.findOne({ propertyId, client: user.client });

    const schema = Joi.object({
      size: Joi.number().required(),
      rooms: Joi.number().required(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((error) => error.message),
      });
    }

    const apartment = await Apartment.findOneAndUpdate({ apartmentId, property: property._id }, value, { new: true });

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Apartment updated successfully",
      apartment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteApartment = async (req, res) => {
  try {
    const { propertyId, apartmentId } = req.params;
    const user = await User.findOne({ userId: req.userId });
    const property = await Property.findOne({ propertyId, client: user.client });

    const apartment = await Apartment.findOne({ apartmentId, property: property._id });

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
    }

    if (apartment.tenant) {
      return res.status(400).json({
        success: false,
        message: "Apartment is currently occupied",
      });
    }

    await Apartment.deleteOne({ apartmentId, property: property._id });

    property.apartments = property.apartments.filter((id) => id.toString() !== apartment._id.toString());
    await property.save();

    res.status(200).json({
      success: true,
      message: "Apartment deleted successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
