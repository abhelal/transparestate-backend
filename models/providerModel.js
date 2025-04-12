const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");
const { SERVICE_TYPES } = require("../constants");

const providerSchema = new Schema(
  {
    providerId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    userId: { type: String, required: true },
    services: [{ type: String, enum: Object.keys(SERVICE_TYPES) }],
  },
  {
    timestamps: true,
  }
);

const Provider = mongoose.model("Provider", providerSchema);
module.exports = Provider;
