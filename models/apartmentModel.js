const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const apartmentSchema = new Schema(
  {
    apartmentId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Apartment = mongoose.model("Apartment", apartmentSchema);
module.exports = Apartment;
