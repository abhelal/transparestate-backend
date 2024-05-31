const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");
const { MAINTENANCE_STATUS } = require("../constants");

const maintenanceSchema = new Schema(
  {
    maintenanceId: {
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
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    apartment: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },

    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    maintenanceType: { type: String },
    maintenanceDetails: { type: String },
    maintenanceDate: { type: Date },
    ImagesBefore: [{ type: String }],
    ImagesAfter: [{ type: String }],
    maintenanceCost: { type: Number },
    maintenanceCostDox: { type: String },

    maintenanceStatus: {
      type: String,
      enum: Object.keys(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);
module.exports = Maintenance;
