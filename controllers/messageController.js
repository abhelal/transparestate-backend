const { USER_ROLES } = require("../constants");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const Maintenance = require("../models/maintenanceModel");
const User = require("../models/userModel");

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
    return { ...conversation.toObject(), myself, other };
  });

  res.status(200).json({ conversations: conversationWithSenderReceiver });
};

exports.getArchivedConversations = async (req, res) => {
  const conversations = await Conversation.find({
    client: req.client,
    participants: { $in: [req.id] },
    archivedBy: req.id,
  })
    .populate({ path: "participants", select: "name role email" })
    .populate({ path: "messages", options: { sort: { createdAt: -1 } }, perDocumentLimit: 1 })
    .sort("-updatedAt");

  const conversationWithSenderReceiver = conversations.map((conversation) => {
    const myself = conversation.participants.find((participant) => participant._id.toString() === req.id);
    const other = conversation.participants.find((participant) => participant._id.toString() !== req.id);
    return { ...conversation.toObject(), myself, other };
  });

  res.status(200).json({ conversations: conversationWithSenderReceiver });
};

exports.getRecentMessages = async (req, res) => {
  const conversations = await Conversation.find({ client: req.client, participants: { $in: [req.id] }, archivedBy: { $ne: req.id } })
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
      perDocumentLimit: 1,
    })
    .sort("-updatedAt")
    .limit(5);

  const conversationWithSenderReceiver = conversations.map((conversation) => {
    const myself = conversation.participants.find((participant) => participant._id.toString() === req.id);
    const other = conversation.participants.find((participant) => participant._id.toString() !== req.id);
    return { ...conversation.toObject(), myself, other };
  });
  res.status(200).json({ messages: conversationWithSenderReceiver });
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
  const archived = conversation.archivedBy.includes(req.id);

  res.status(200).json({ conversationId, archived, myself, other, messages });
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

exports.unarchiveConversation = async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findOne({ conversationId });
  conversation.archivedBy = conversation.archivedBy.filter((id) => id.toString() !== req.id);
  await conversation.save();
  res.status(200).json({ message: "Conversation unarchived" });
};
