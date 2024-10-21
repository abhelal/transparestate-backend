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
  const conversations = await Conversation.find({
    client: req.client,
    participants: { $in: [req.id] },
    archivedBy: { $ne: req.id },
  })
    .populate({
      path: "participants",
      select: "name role email",
      populate: {
        path: "properties",
        select: "name",
      },
    })
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 } },
      perDocumentLimit: 1,
    })
    .sort("-updatedAt");

  const conversationWithSenderReceiver = conversations.map((conversation) => {
    const myself = conversation.participants.find((participant) => participant._id.toString() === req.id);
    const other = conversation.participants.find((participant) => participant._id.toString() !== req.id);
    return { conversation, myself, other };
  });

  res.status(200).json({ conversations: conversationWithSenderReceiver });
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
  const conversation = await Conversation.findOne({ conversationId })
    .populate({
      path: "participants",
      select: "userId name role email",
      populate: {
        path: "properties",
        select: "name",
      },
    })
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 } },
    });

  const myself = conversation.participants.find((participant) => participant._id.toString() === req.id);
  const other = conversation.participants.find((participant) => participant._id.toString() !== req.id);

  const messages = conversation.messages;

  res.status(200).json({ conversationId, myself, other, messages });
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
  const receiver = req.params.id;
  const sender = req.id;

  const conversation = await Conversation.findOne({
    participants: { $all: [sender, receiver] },
  });

  if (!conversation) {
    const newConversation = await Conversation.create({
      participants: [sender, receiver],
      client: req.client,
    });
    return res.status(200).json({ conversationId: newConversation.conversationId });
  }
  res.status(200).json({ conversationId: conversation.conversationId });
};

exports.archiveConversation = async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findOne({ conversationId });
  conversation.archivedBy.push(req.id);
  await conversation.save();
  res.status(200).json({ message: "Conversation archived" });
};
