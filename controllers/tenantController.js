const User = require("../models/userModel");
const Tenant = require("../models/tenantModel");
const Apartment = require("../models/apartmentModel");

const Joi = require("joi");
const { USER_ROLES } = require("../constants");

exports.updateTenantInfo = async (req, res) => {
  try {
    const userId = req.params.id;

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
