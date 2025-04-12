const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    name: { type: String, required: true },
    documentCategory: { type: String, required: true },
    note: { type: String },
    originalname: { type: String },
    key: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

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
    documents: [documentSchema],
  },
  {
    timestamps: true,
  }
);

const Tenant = mongoose.model("Tenant", tenantSchema);
module.exports = Tenant;
