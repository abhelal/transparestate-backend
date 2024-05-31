const User = require("../models/userModel");
const Tenant = require("../models/tenantModel");
const Apartment = require("../models/apartmentModel");

const Joi = require("joi");
const { USER_ROLES } = require("../constants");
const { deleteFile } = require("../services/storage");

exports.updateTenantInfo = async (req, res) => {
  try {
    const userId = req.params.userId;

    const tenantSchema = Joi.object({
      birthDate: Joi.string(),
      job: Joi.string(),
      familyMember: Joi.number(),
      permAddress: Joi.string(),
      permCountry: Joi.string(),
      permCity: Joi.string(),
      permZipCode: Joi.string(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = tenantSchema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }

    const user = await User.findOne({ userId, client: req.client, role: USER_ROLES.TENANT });

    if (!user) {
      return res.status(409).json({
        success: false,
        message: "User not found",
      });
    }

    const { lastErrorObject } = await Tenant.findOneAndUpdate({ userId }, value, { new: true, upsert: true, includeResultMetadata: true });

    if (!lastErrorObject.updatedExisting) {
      await User.findOneAndUpdate({ userId }, { tenant: lastErrorObject.upserted });
    }

    return res.status(201).json({ message: "Tenant updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateTenantApartment = async (req, res) => {
  try {
    const userId = req.params.userId;
    const schema = Joi.object({
      apartmentId: Joi.string().required(),
      leaseStartDate: Joi.string().required(),
      rent: Joi.number().required(),
      deposit: Joi.number().required(),
    }).options({ stripUnknown: true, abortEarly: false });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(409).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }

    const { apartmentId, leaseStartDate, rent, deposit } = value;

    const tenant = await User.findOne({ userId, client: req.client });

    if (!tenant) {
      return res.status(409).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const apartment = await Apartment.findOne({ apartmentId, client: req.client });

    if (!apartment) {
      return res.status(409).json({
        success: false,
        message: "Apartment not found",
      });
    }

    if (apartment.tenant && apartment.tenant.toString() !== tenant._id.toString()) {
      return res.status(409).json({
        success: false,
        message: "Apartment already occupied",
      });
    }

    apartment.tenant = tenant._id;
    apartment.leaseStartDate = leaseStartDate;
    apartment.rent = rent;
    apartment.deposit = deposit;

    await apartment.save();

    tenant.apartments = tenant.apartments.includes(apartment._id) ? tenant.apartments : [...tenant.apartments, apartment._id];
    tenant.properties = tenant.properties.includes(apartment.property) ? tenant.properties : [...tenant.properties, apartment.property];

    await tenant.save();

    return res.status(201).json({ message: "Tenant apartment updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteTenantApartment = async (req, res) => {
  try {
    const { userId, apartmentId } = req.params;
    const tenant = await User.findOne({ userId, client: req.client });
    const apartment = await Apartment.findOne({ apartmentId, client: req.client });

    if (!tenant || !apartment) {
      return res.status(409).json({
        success: false,
        message: "Tenant or Apartment not found",
      });
    }

    tenant.apartments = tenant.apartments.filter((id) => id.toString() !== apartment._id.toString());
    await tenant.save();

    apartment.tenant = null;
    apartment.leaseStartDate = null;
    apartment.rent = null;
    apartment.deposit = null;
    await apartment.save();

    const tenantApartments = await Apartment.find({ tenant: tenant._id, property: apartment.property });

    if (tenantApartments.length === 0) {
      tenant.properties = tenant.properties.filter((id) => id.toString() !== apartment.property.toString());
      await tenant.save();
    }

    return res.status(201).json({ message: "Tenant apartment removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createTenantDocument = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, documentCategory, note } = req.body;

    const { file } = req;

    const user = await User.findOne({ userId, client: req.client });

    if (!user) {
      return res.status(409).json({
        success: false,
        message: "User not found",
      });
    }

    if (!file) {
      return res.status(409).json({
        success: false,
        message: "File not found",
      });
    }

    const document = {
      name,
      documentCategory,
      note,
      originalname: file.originalname,
      key: file.key,
      url: file.location,
    };

    const tenant = await Tenant.findOne({ userId });
    tenant.documents.push(document);
    await tenant.save();

    return res.status(201).json({ message: "Document created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteTenantDocument = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { Key } = req.params;
    const user = await User.findOne({ userId, client: req.client });

    if (!user) {
      return res.status(409).json({
        success: false,
        message: "User not found",
      });
    }
    const tenant = await Tenant.findOne({ userId });

    if (!tenant) {
      return res.status(409).json({
        success: false,
        message: "Tenant not found",
      });
    }

    tenant.documents = tenant.documents.filter((doc) => doc.key !== Key);
    await tenant.save();

    await deleteFile(Key);

    return res.status(201).json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyApartment = async (req, res) => {
  try {
    const userId = req.userId;
    const tenant = await User.findOne({ userId, client: req.client }).populate({
      path: "apartments",
      populate: {
        path: "property",
        select: "name",
      },
    });

    if (!tenant) {
      return res.status(409).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const apartments = tenant.apartments.map((apartment) => ({
      apartmentId: apartment.apartmentId,
      property: apartment.property,
      floor: apartment.floor,
      door: apartment.door,
    }));

    return res.status(200).json({ success: true, apartments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
