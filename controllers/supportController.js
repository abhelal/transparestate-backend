const SupportTicket = require("../models/supportTicketModel");
const Joi = require("joi");

exports.createSupportTicket = async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const ticket = await SupportTicket.create({
      title: req.body.title,
      description: req.body.description,
      client: req.client,
      openedBy: req.id,
    });

    res.status(201).json({ message: "Ticket created successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create ticket by superadmin or admin

exports.createSupportTicketByAdmin = async (req, res) => {
  const schema = Joi.object({
    user: Joi.object().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const ticket = await SupportTicket.create({
      title: req.body.title,
      description: req.body.description,
      client: req.body.user.client._id,
      openedBy: req.body.user._id,
    });

    res.status(201).json({ message: "Ticket created successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get my tickets

exports.getMyTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find({ client: req.client, openedBy: req.id }).sort({ createdAt: -1 }).skip(skip).limit(limit);

    const total = await SupportTicket.countDocuments({ client: req.client, openedBy: req.id });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ tickets, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all tickets

exports.getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "openedBy",
        select: "name email contactNumber role",
      })
      .populate({
        path: "client",
        select: "companyName",
      });

    const total = await SupportTicket.countDocuments({});
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ tickets, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get open tickets

exports.getOpenTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ status: "OPEN" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "openedBy",
        select: "name email contactNumber role",
      })
      .populate({
        path: "client",
        select: "companyName",
      });

    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update ticket status

exports.updateTicketStatus = async (req, res) => {
  const schema = Joi.object({
    status: Joi.string().required().valid("OPEN", "CLOSED", "PENDING"),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket status updated successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
