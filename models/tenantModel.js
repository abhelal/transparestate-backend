const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tenantSchema = new Schema(
  {
    userId: { type: String, required: true },
    birthDate: { type: Date },
    job: { type: String },
    familyMember: { type: Number },
    permAddress: { type: String },
    permCountry: { type: String },
    permCity: { type: String },
    permZipCode: { type: String },
  },
  {
    timestamps: true,
  }
);

const Tenant = mongoose.model("Tenant", tenantSchema);
module.exports = Tenant;
