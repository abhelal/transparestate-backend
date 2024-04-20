const mongoose = require("mongoose");
const { COUPON_TYPES } = require("../constants");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    couponType: {
      type: String,
      required: true,
      enum: [COUPON_TYPES.FIXED, COUPON_TYPES.PERCENTAGE, COUPON_TYPES.TEST],
    },
    discount: {
      type: Number,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      default: 1,
    },
    uses: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
