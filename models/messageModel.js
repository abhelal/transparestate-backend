const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const messageSchema = new Schema(
  {
    messageId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
    conversationId: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    senderId: { type: String },
    isChild: { type: Boolean, default: false },
    mother: { type: Schema.Types.ObjectId, ref: "Message" },
    text: String,
    image: String,
    file: String,
    read: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
