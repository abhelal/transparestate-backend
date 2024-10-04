const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const supportTicketSchema = new Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    status: { type: String, required: true, enum: ["OPEN", "CLOSED", "PENDING"], default: "OPEN" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    openedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
module.exports = SupportTicket;
