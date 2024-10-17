const Contact = require("../models/contactModel");

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const contact = new Contact({ name, email, phone, message });
    await contact.save();
    return res.status(201).json({ success: true, contact });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const key = req.query.query || "";
    const limit = 10;
    const searchQuery = {};

    if (key) {
      searchQuery.$or = [
        { name: { $regex: key, $options: "i" } },
        { email: { $regex: key, $options: "i" } },
        { phone: { $regex: key, $options: "i" } },
      ];
    }
    const contacts = await Contact.find(searchQuery)
      .limit(limit)
      .skip(limit * (page - 1));
    const totalContacts = await Contact.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalContacts / limit);
    return res.status(200).json({ success: true, contacts, totalPages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findOne({ contactId });
    return res.status(200).json({ success: true, contact });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateResponded = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findOne({ contactId });
    contact.responded = !contact.responded;
    await contact.save();
    const message = contact.responded ? "Message has been responded" : "Message has been marked as not responded";
    return res.status(200).json({ success: true, message, contact });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
