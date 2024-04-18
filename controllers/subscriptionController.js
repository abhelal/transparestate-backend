const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const Client = require("../models/clientModel");

const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");

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
  if (user.status === USER_STATUS.ACTIVE)
    return res.status(403).json({ message: "You are already a active client" });

  const client = await Client.findById(user.client);
  if (!client) return res.status(404).json({ message: "Client not found" });

  const coupon = await Coupon.findOne({ code: value.code });
  if (
    !coupon ||
    coupon.codeType != "test" ||
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
    subscriptionPlan: coupon.codeType,
    subscriptionValidUntil: new Date() + coupon.discount * 30 * 24 * 60 * 60 * 1000,
  });

  coupon.set({
    uses: coupon.uses + 1,
    user: user._id,
    active: false,
  });

  await user.save();
  await client.save();
  await coupon.save();

  return res.status(200).json({ message: "Your transparestate activated successfully" });
};
