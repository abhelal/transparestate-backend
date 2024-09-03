const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const subscriptionPlanSchema = new Schema(
  {
    planId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    features: { type: [String], default: [] },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
module.exports = SubscriptionPlan;
