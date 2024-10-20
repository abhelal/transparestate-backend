const { USER_ROLES } = require("../constants");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const Maintenance = require("../models/maintenanceModel");
const User = require("../models/userModel");

exports.getArchivedConversations = async (req, res) => {
  let query = {
    client: req.client,
    archivedBy: { $eq: req.id },
  };

  if (req.role === USER_ROLES.TENANT) {
    query.tenant = req.id;
  }

  if (req.role === USER_ROLES.MANAGER || req.role === USER_ROLES.MAINTAINER || req.role === USER_ROLES.JANITOR) {
    const staff = await User.findById(req.id);
    const properties = staff.properties;
    query.property = { $in: properties };
  }

  const conversations = await Conversation.find(query)
    .populate("property", "name")
    .populate("maintenance", "maintenanceType maintenanceDetails")
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 } },
      perDocumentLimit: 1,
    })
    .sort("-updatedAt");
  res.status(200).json({ conversations });
};

exports.getConversations = async (req, res) => {
  let query = {
    client: req.client,
    archivedBy: { $ne: req.id },
  };

  if (req.role === USER_ROLES.TENANT) {
    query.tenant = req.id;
  }

  if (req.role === USER_ROLES.MANAGER || req.role === USER_ROLES.MAINTAINER || req.role === USER_ROLES.JANITOR) {
    const staff = await User.findById(req.id);
    const properties = staff.properties;
    query.property = { $in: properties };
  }

  const conversations = await Conversation.find(query)
    .populate("property", "name")
    .populate("maintenance", "maintenanceType maintenanceDetails")
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 } },
      perDocumentLimit: 1,
    })
    .sort("-updatedAt");
  res.status(200).json({ conversations });
};

exports.getRecentMessages = async (req, res) => {
  let query = {
    client: req.client,
  };

  if (req.role === USER_ROLES.TENANT) {
    query.tenant = req.id;
  }

  if (req.role === USER_ROLES.MANAGER || req.role === USER_ROLES.MAINTAINER || req.role === USER_ROLES.JANITOR) {
    const staff = await User.findById(req.id);
    const properties = staff.properties;
    query.property = { $in: properties };
  }

  const messages = await Conversation.find(query)
    .populate("property", "name")
    .populate("maintenance", "maintenanceType maintenanceDetails")
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 } },
      perDocumentLimit: 1,
    })
    .sort("-updatedAt");
  res.status(200).json({ messages });
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const messages = await Conversation.findOne({ conversationId })
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 } },
    })
    .populate("property", "name")
    .populate("tenant", "name");
  res.status(200).json(messages);
};

exports.sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { text, image, file } = req.body;
  const message = await Message.create({
    sender: req.id,
    conversationId,
    text,
    image,
    file,
  });
  const conversation = await Conversation.findById(conversationId);
  conversation.messages.push(message._id);
  await conversation.save();
  res.status(200).json({ message });
};

exports.startConversation = async (req, res) => {
  const { maintenanceId } = req.params;
  const conversation = await Conversation.findOne({ maintenanceId });
  if (!conversation) {
    const maintenance = await Maintenance.findOne({ maintenanceId });
    const newConversation = await Conversation.create({
      maintenanceId: maintenance.maintenanceId,
      client: maintenance.client,
      property: maintenance.property,
      tenant: maintenance.tenant,
      maintenance: maintenance._id,
    });
    return res.status(200).json({ conversationId: newConversation.conversationId });
  }
  res.status(200).json({ conversationId: conversation.conversationId });
};

exports.startNewConversation = async (req, res) => {
  const { id } = req.params;
  const conversation = await Conversation.findOne({ tenant: id, property: req.property });
  if (!conversation) {
    const newConversation = await Conversation.create({
      tenant: id,
      property: req.property,
      client: req.client,
    });
    return res.status(200).json({ conversationId: newConversation.conversationId });
  }
  res.status(200).json({ conversationId: conversation.conversationId });
};

exports.archiveConversation = async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findOne({ conversationId });
  conversation.archived = true;
  conversation.archivedBy.push(req.id);
  await conversation.save();
  res.status(200).json({ message: "Conversation archived" });
};
