const Coupon = require("../models/couponModel");
const User = require("../models/userModel");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const { USER_ROLES, USER_STATUS, COUPON_TYPES } = require("../constants");

exports.generateCoupon = async (req, res) => {
  const schema = Joi.object({
    couponType: Joi.string()
      .required()
      .valid(COUPON_TYPES.FIXED, COUPON_TYPES.PERCENTAGE, COUPON_TYPES.TEST),
    discount: Joi.number().required(),
    expirationDate: Joi.date().required(),
    maxUses: Joi.number().required(),
    description: Joi.string(),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(409).json({
      success: false,
      message: error.details.map((err) => err.message),
    });
  } else {
    const { couponType, discount, expirationDate, maxUses, description } = value;
    const code = uuidv4();
    const newCoupon = new Coupon({
      code,
      couponType,
      discount,
      expirationDate,
      maxUses,
      description,
    });
    await newCoupon.save();
    return res.status(200).json({
      success: true,
      message: "Coupon generated successfully",
    });
  }
};

exports.getAllCoupons = async (req, res) => {
  const { query = "", page = 1 } = req.query;

  const totalCoupons = await Coupon.countDocuments({
    $or: [
      { code: { $regex: query, $options: "i" } },
      { "user.userId": { $regex: query, $options: "i" } },
    ],
  });

  const coupons = await Coupon.find({
    $or: [
      { code: { $regex: query, $options: "i" } },
      { "user.userId": { $regex: query, $options: "i" } },
    ],
  })
    .populate("user", "-_id userId")
    .limit(10)
    .skip(10 * (page - 1))
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    totalPages: Math.ceil(totalCoupons / 10),
    currentPage: page,
    coupons,
  });
};

exports.deleteCoupon = async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found",
    });
  }
  if (coupon.uses > 0) {
    return res.status(409).json({
      success: false,
      message: "Cannot delete coupon that has been used",
    });
  }
  await Coupon.findByIdAndDelete(id);
  return res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
};
