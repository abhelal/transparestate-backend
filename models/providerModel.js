const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { SERVICE_TYPES } = require("../constants");

const providerSchema = new Schema(
  {
    userId: { type: String, required: true },
    services: [{ type: String, enum: Object.keys(SERVICE_TYPES) }],
  },
  {
    timestamps: true,
  }
);

const Provider = mongoose.model("Provider", providerSchema);
module.exports = Provider;
