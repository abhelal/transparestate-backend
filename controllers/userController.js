const { USER_ROLES, USER_STATUS } = require("../constants");
const User = require("../models/userModel");
const {
  fetchAllClients,
  fetchClient,
  createUserAccount,
  fetchUsers,
  fetchUser,
  updateUserProperties,
  updateUserPermissions,
  updateUserInfo,
  updateUserStatus,
  updateUserPassword,
  deleteUserAccount,
} = require("../services/user");

exports.getAllClients = async (req, res) => {
  try {
    const response = await fetchAllClients({ ...req.query });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getClient = async (req, res) => {
  try {
    const response = await fetchClient(req.params.userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateClientStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    user.status = user.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
    await user.save();

    return res.status(200).json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.createMaintainer = async (req, res) => {
  try {
    const userData = req.body;
    const response = await createUserAccount({ userData, client: req.client, role: USER_ROLES.MAINTAINER });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getAllMaintainers = async (req, res) => {
  try {
    const response = await fetchUsers({ ...req.query, client: req.client, role: USER_ROLES.MAINTAINER });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getMaintainer = async (req, res) => {
  try {
    const userId = req.params.userId;
    const response = await fetchUser({ userId, client: req.client, role: USER_ROLES.MAINTAINER });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.createJanitor = async (req, res) => {
  try {
    const userData = req.body;
    const response = await createUserAccount({ userData, client: req.client, role: USER_ROLES.JANITOR });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getAllJanitors = async (req, res) => {
  try {
    const response = await fetchUsers({ ...req.query, client: req.client, role: USER_ROLES.JANITOR });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getJanitor = async (req, res) => {
  try {
    const userId = req.params.userId;
    const response = await fetchUser({ userId, client: req.client, role: USER_ROLES.JANITOR });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.createTenant = async (req, res) => {
  try {
    const userData = req.body;
    const response = await createUserAccount({ userData, client: req.client, role: USER_ROLES.TENANT });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getAllTenants = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const searchKey = req.query.query || "";
    const page = req.query.page || 1;

    let query = {
      client: user.client,
      role: USER_ROLES.TENANT,
      status: { $ne: USER_STATUS.DELETED },
      $or: [
        { name: { $regex: searchKey, $options: "i" } },
        { userId: { $regex: searchKey, $options: "i" } },
        { email: { $regex: searchKey, $options: "i" } },
      ],
    };

    if (user.role === USER_ROLES.MAINTAINER || user.role === USER_ROLES.JANITOR) {
      query.properties = { $in: user.properties };
    }

    const users = await User.find(query)
      .select("-_id -password -accessToken")
      .populate("client")
      .populate("properties", "-_id name propertyId")
      .limit(10)
      .skip(10 * (page - 1))
      .sort({ createdAt: -1 });

    const total = await User.find(query).countDocuments();

    return res.status(200).json({ success: true, currentPage: page, totalPages: Math.ceil(total / 10), users });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getTenant = async (req, res) => {
  try {
    const userId = req.params.userId;
    const response = await fetchUser({ userId, client: req.client, role: USER_ROLES.TENANT });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const info = req.body;
    const response = await updateUserInfo({ userId, client: req.client, info });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const response = await updateUserStatus({ userId, client: req.client });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateProperties = async (req, res) => {
  try {
    const userId = req.params.userId;
    const properties = req.body.properties || [];
    const response = await updateUserProperties({ userId, client: req.client, properties });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const permissions = req.body.permissions || [];
    const response = await updateUserPermissions({ userId, client: req.client, permissions });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { password } = req.body;
    const response = await updateUserPassword({ userId, client: req.client, password });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const response = await deleteUserAccount({ userId, client: req.client });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const users = await User.find({
      email: { $regex: email, $options: "i" },
      role: { $ne: USER_ROLES.SUPERADMIN },
    })
      .select("name email contactNumber client")
      .populate("client")
      .limit(10);
    if (!users) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
