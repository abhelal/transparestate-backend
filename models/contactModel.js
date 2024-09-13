const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { customAlphabet } = require("nanoid");

const contactSchema = new Schema(
  {
    contactId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    responded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
