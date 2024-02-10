const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const companySchema = new Schema({
  companyId: {
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
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
