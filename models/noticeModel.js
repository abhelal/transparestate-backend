const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const noticeSchema = new Schema(
  {
    noticeId: {
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
    date: { type: Date, required: true },
    dateEvent: { type: Boolean, default: false },
    properties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    title: { type: String, required: true },
    body: { type: String, required: true },
    readBy: [{ type: String }],
    archived: { type: Boolean, default: false },
    archivedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Notice = mongoose.model("Notice", noticeSchema);
module.exports = Notice;
