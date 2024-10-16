const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");
const { PROPERTY_TYPE } = require("../constants");

const propertySchema = new Schema(
  {
    propertyId: {
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
    maintainers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    janitors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    tenants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    propertyType: {
      type: String,
      required: true,
      enum: [PROPERTY_TYPE.APARTMENT, PROPERTY_TYPE.OFFICE_BUILDING, PROPERTY_TYPE.HOUSE, PROPERTY_TYPE.WAREHOUSE],
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    street: {
      type: String,
      required: true,
    },
    buildingNo: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    allowPets: {
      type: Boolean,
      default: false,
    },
    amenities: [String],
    utilities: [String],
    apartments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Apartment",
      },
    ],
  },

  {
    timestamps: true,
  }
);

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
