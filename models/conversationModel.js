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
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    client: { type: Schema.Types.ObjectId, ref: "User" },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    archivedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
