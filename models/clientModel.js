const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const clientSchema = new Schema(
  {
    clisentId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    companyName: {
      type: String,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
    },
    description: { type: String },
    price: { type: Number },
    duration: { type: Number },
    subscriptionValidUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
