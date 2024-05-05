const client = require("../config/redis");
const { USER_ROLES } = require("../constants");
const {
  fetchAllClients,
  fetchClient,
  fetchUsers,
  fetchUser,
  updateUserProperties,
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

exports.getAllManagers = async (req, res) => {
  try {
    const response = await fetchUsers({ ...req.query, client: req.client, role: USER_ROLES.MANAGER });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getManager = async (req, res) => {
  try {
    const userId = req.params.userId;
    const response = await fetchUser({ userId, client: req.client, role: USER_ROLES.MANAGER });
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

exports.getAllTenants = async (req, res) => {
  try {
    const response = await fetchUsers({ ...req.query, client: req.client, role: USER_ROLES.TENANT });
    return res.status(200).json(response);
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
