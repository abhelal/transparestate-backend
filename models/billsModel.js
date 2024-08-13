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
    date: { type: Date, required: true, default: new Date() },
    description: { type: String },
    amount: { type: Number },
    status: {
      type: String,
      default: "unpaid",
      enum: ["paid", "unpaid"],
    },
  },
  { timestamps: true }
);

const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;
