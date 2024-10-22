const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const feedbackSchema = new Schema(
  {
    feedbackId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    feedbackBy: { type: Schema.Types.ObjectId, ref: "User" },
    read: { type: Boolean, default: false },
    star: { type: Number },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
