const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema = new Schema(
  {
    name: { type: String, required: true },
    language: { type: String },
    delta: { type: String, required: true },
    htmlContent: { type: String, required: true },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
