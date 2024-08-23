const User = require("../models/userModel");
const Bill = require("../models/billsModel");

exports.getMyBills = async (req, res) => {
  try {
    const userId = req.userId;
    const tenant = await User.findOne({ userId, client: req.client });

    if (!tenant) {
      return res.status(409).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const bills = await Bill.find({ tenant: tenant._id });

    return res.status(200).json({ success: true, bills: bills });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find({ client: req.client }).populate("apartment", "floor door").populate("property", "name");
    return res.status(200).json({ success: true, bills: bills });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateBillStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { status } = req.body;

    const bill = await Bill.findOne({ billId, client: req.client });

    if (!bill) {
      return res.status(409).json({
        success: false,
        message: "Bill not found",
      });
    }

    bill.status = status;
    await bill.save();

    return res.status(200).json({ success: true, message: "Bill status updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
