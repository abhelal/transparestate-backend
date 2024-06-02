const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");
const { USER_ROLES } = require("../constants");

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
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    senderId: { type: String },
    senderRole: { type: String, enum: Object.keys(USER_ROLES) },
    isChild: { type: Boolean, default: false },
    mother: { type: Schema.Types.ObjectId, ref: "Message" },
    text: String,
    image: String,
    file: String,
    read: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    archivedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
