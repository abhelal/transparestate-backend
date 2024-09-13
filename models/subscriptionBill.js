const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const subscriptionBillSchema = new Schema(
  {
    billId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid"],
    },
  },
  { timestamps: true }
);

const SubscriptionBill = mongoose.model("SubscriptionBill", subscriptionBillSchema);
module.exports = SubscriptionBill;
