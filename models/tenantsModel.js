const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tenantsSchema = new Schema(
  {
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

const Tenants = mongoose.model("Tenants", tenantsSchema);
module.exports = Tenants;
