const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const conversationSchema = new Schema(
  {
    conversationId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    maintenanceId: { type: String, unique: true },
    client: { type: Schema.Types.ObjectId, ref: "User" },
    property: { type: Schema.Types.ObjectId, ref: "Property" },
    tenant: { type: Schema.Types.ObjectId, ref: "User" },
    maintenance: { type: Schema.Types.ObjectId, ref: "Maintenance" },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    archived: { type: Boolean, default: false },
    archivedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
