const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const billSchema = new Schema(
  {
    billId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    apartment: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: { type: String, required: true },
    year: { type: String, required: true },
    period: { type: String, required: true, enum: ["first-half", "second-half"] },
    type: { type: String, required: true, default: "rent", enum: ["rent", "deposit"] },
    description: { type: String },
    amount: { type: Number },
    status: {
      type: String,
      default: "unpaid",
      enum: ["paid", "unpaid"],
    },
    paymentDate: { type: Date },
  },
  { timestamps: true }
);

const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;
