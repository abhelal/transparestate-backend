const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const Client = require("../models/clientModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");
const SubscriptionBill = require("../models/subscriptionBill");

const { USER_ROLES, USER_STATUS, COUPON_TYPES } = require("../constants");
const Joi = require("joi");

exports.getSubscriptionPlans = async (req, res) => {
  const plans = await SubscriptionPlan.find({});
  return res.status(200).json({ success: true, plans });
};

exports.createSubscriptionPlan = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Name is required",
    }),
    price: Joi.number().required().messages({
      "number.base": "Price must be a number",
      "number.empty": "Price is required",
    }),
    duration: Joi.number().required().messages({
      "number.base": "Duration must be a number",
      "number.empty": "Duration is required",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description is required",
    }),
    features: Joi.array().items(Joi.string()).required().messages({
      "array.base": "Features must be an array",
      "array.empty": "Features is required",
    }),
  });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const plan = new SubscriptionPlan(value);
  await plan.save();

  return res.status(200).json({ success: true, message: "Subscription plan created successfully" });
};

exports.deleteSubscriptionPlan = async (req, res) => {
  const plan = await SubscriptionPlan.findOneAndDelete({ planId: req.params.id });
  if (!plan) return res.status(404).json({ message: "Subscription plan not found" });

  return res.status(200).json({ success: true, message: "Subscription plan deleted successfully" });
};

exports.makePopular = async (req, res) => {
  const plan = await SubscriptionPlan.findOne({ planId: req.params.id });
  if (!plan) return res.status(404).json({ message: "Subscription plan not found" });
  if (plan.isPopular) return res.status(400).json({ message: "Subscription plan is already popular" });
  if (plan.status === "inactive") return res.status(400).json({ message: "Subscription plan is inactive" });

  await SubscriptionPlan.updateMany({ isPopular: true }, { isPopular: false });
  plan.set({ isPopular: true });
  await plan.save();

  return res.status(200).json({ success: true, message: "Subscription plan marked as popular", plan });
};

exports.deactivatePlan = async (req, res) => {
  const plan = await SubscriptionPlan.findOne({ planId: req.params.id });
  if (!plan) return res.status(404).json({ message: "Subscription plan not found" });
  plan.set({ status: plan.status === "active" ? "inactive" : "active", isPopular: false });
  await plan.save();

  return res.status(200).json({ success: true, message: "Subscription plan deactivated successfully" });
};

exports.updateSubscriptionPlan = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Name is required",
    }),
    price: Joi.number().required().messages({
      "number.base": "Price must be a number",
      "number.empty": "Price is required",
    }),
    duration: Joi.number().required().messages({
      "number.base": "Duration must be a number",
      "number.empty": "Duration is required",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description is required",
    }),
    features: Joi.array().items(Joi.string()).required().messages({
      "array.base": "Features must be an array",
      "array.empty": "Features is required",
    }),
  }).options({ stripUnknown: true, abortEarly: false });

  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const plan = await SubscriptionPlan.findOneAndUpdate({ planId: req.params.id }, value, { new: true });
  if (!plan) return res.status(404).json({ message: "Subscription plan not found" });

  return res.status(200).json({ success: true, message: "Subscription plan updated successfully" });
};

exports.getPlans = async (req, res) => {
  const plans = await SubscriptionPlan.find({ status: "active" });
  return res.status(200).json({ success: true, plans });
};

exports.getPlanById = async (req, res) => {
  const plan = await SubscriptionPlan.findOne({ planId: req.params.id });
  if (!plan) return res.status(404).json({ message: "Subscription plan not found" });

  return res.status(200).json({ success: true, plan });
};

exports.activeSubscription = async (req, res) => {
  const schema = Joi.object({
    code: Joi.string().required().messages({
      "string.empty": "Coupon code is required",
    }),
  });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await User.findOne({ userId: req.userId });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role !== USER_ROLES.CLIENT) return res.status(403).json({ message: "Unauthorized" });
  if (user.status === USER_STATUS.ACTIVE) return res.status(403).json({ message: "You are already a active client" });

  const client = await Client.findById(user.client);
  if (!client) return res.status(404).json({ message: "Client not found" });

  const coupon = await Coupon.findOne({ code: value.code });
  if (
    !coupon ||
    coupon.couponType != COUPON_TYPES.TEST ||
    !coupon.active ||
    coupon.uses >= coupon.maxUses ||
    coupon.expirationDate < new Date()
  )
    return res.status(404).json({ message: "Your coupon is not valid" });

  user.set({
    status: USER_STATUS.ACTIVE,
  });

  client.set({
    isSubscribed: true,
    subscriptionPlan: coupon.couponType,
    subscriptionValidUntil: new Date(Date.now() + coupon.discount * 24 * 60 * 60 * 1000),
  });

  coupon.set({
    uses: coupon.uses + 1,
    user: user._id,
    active: false,
  });

  const token = await user.generateAuthToken();

  await user.save();
  await client.save();
  await coupon.save();

  return res
    .status(200)
    .cookie("accessToken", token, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      domain: process.env.DOMAIN,
    })
    .json({
      success: true,
      message: "Your transparestate activated successfully",
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
};

exports.getMySubscription = async (req, res) => {
  const subscription = await Client.findOne({ owner: req.id, isSubscribed: true });
  return res.status(200).json({ success: true, subscription });
};

exports.getMyBills = async (req, res) => {
  const bills = await SubscriptionBill.find({ client: req.client });

  return res.status(200).json({ success: true, bills });
};

exports.activeByCode = async (req, res) => {
  const schema = Joi.object({
    code: Joi.string().required().messages({
      "string.empty": "Coupon code is required",
    }),
  });

  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const client = await Client.findOne({ owner: req.id });
  if (!client) return res.status(404).json({ message: "Client not found" });

  const coupon = await Coupon.findOne({ code: value.code });

  if (
    !coupon ||
    coupon.couponType != COUPON_TYPES.TEST ||
    !coupon.active ||
    coupon.uses >= coupon.maxUses ||
    coupon.expirationDate < new Date()
  )
    return res.status(404).json({ message: "Your coupon is not valid" });

  client.set({
    isSubscribed: true,
    subscriptionPlan: coupon.couponType,
    subscriptionValidUntil: new Date(Date.now() + coupon.discount * 24 * 60 * 60 * 1000),
    description: coupon.description,
    duration: coupon.discount,
    price: 0,
  });

  coupon.set({
    uses: coupon.uses + 1,
    user: client.owner,
    active: false,
  });

  await client.save();
  await coupon.save();

  const user = await User.findByIdAndUpdate(req.id, { status: USER_STATUS.ACTIVE });
  const token = await user.generateAuthToken();
  await user.save();

  await SubscriptionBill.create({
    client: client._id,
    description: "Subscription activated by code",
    amount: 0,
    status: "paid",
  });

  return res
    .status(200)
    .cookie("accessToken", token, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      domain: process.env.DOMAIN,
    })
    .json({
      success: true,
      message: "Your subscription activated successfully",
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
};
