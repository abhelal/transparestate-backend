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
    floor: {
      type: Number,
      required: true,
    },
    door: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    rooms: {
      type: Number,
      required: true,
    },
    leaseStartDate: {
      type: Date,
    },
    leaseEndDate: {
      type: Date,
    },
    rent: {
      type: Number,
    },
    deposit: {
      type: Number,
    },
    lateFee: {
      type: Number,
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
