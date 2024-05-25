const User = require("../models/userModel");
const Property = require("../models/propertyModel");
const { USER_ROLES, USER_STATUS } = require("../constants");
const Joi = require("joi");
const redisClient = require("../config/redis");
const { toSentenceCase } = require("../utils/helper");

exports.fetchAllClients = async ({ query = "", page = 1 }) => {
  const total = await User.countDocuments({
    role: USER_ROLES.CLIENT,
    $or: [{ name: { $regex: query, $options: "i" } }, { userId: { $regex: query, $options: "i" } }],
  });

  const totalPages = Math.ceil(total / 10);

  const clients = await User.find({
    role: USER_ROLES.CLIENT,
    $or: [{ name: { $regex: query, $options: "i" } }, { userId: { $regex: query, $options: "i" } }],
  })
    .select("-_id -__v -createdAt -updatedAt -password -accessToken -refreshToken")
    .limit(10)
    .skip((page - 1) * 10)
    .sort({ createdAt: -1 })
    .populate("client", "-_id -createdAt -updatedAt -owner -__v");
  return {
    success: true,
    currentPage: +page,
    totalPages,
    clients,
  };
};

exports.fetchClient = async (id) => {
  const client = await User.findOne({ userId: id, role: USER_ROLES.CLIENT })
    .select("-_id -__v -password -accessToken -refreshToken")
    .populate("client", "-__v -_id -createdAt -updatedAt")
    .populate("properties", "-_id name")
    .lean();
  return {
    success: true,
    client,
  };
};

exports.createUserAccount = async ({ userData, client, role }) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    contactNumber: Joi.string().required().min(3),
    password: Joi.string().required().min(8),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = schema.validate(userData);

  if (error) {
    const message = error.details.map((err) => err.message);
    throw new Error(message);
  }

  const isExists = await User.findOne({ email: value.email });

  if (isExists) {
    throw new Error("Email already exists");
  }

  const user = new User({
    ...value,
    role,
    client,
  });

  await user.save();

  return {
    success: true,
    message: toSentenceCase(role + " created successfully"),
  };
};

exports.fetchUsers = async ({ query = "", page = 1, client, role }) => {
  const total = await User.find({
    role,
    client,
    status: { $ne: USER_STATUS.DELETED },
  }).countDocuments();

  const users = await User.find({
    role,
    client,
    status: { $ne: USER_STATUS.DELETED },
    $or: [
      { name: { $regex: query, $options: "i" } },
      { userId: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  })
    .select("-_id -password -accessToken")
    .populate("client")
    .populate("properties", "-_id name propertyId")
    .limit(10)
    .skip(10 * (page - 1))
    .sort({ createdAt: -1 });

  return {
    success: true,
    currentPage: page,
    totalPages: Math.ceil(total / 10),
    users,
  };
};

exports.fetchUser = async ({ userId, client, role }) => {
  const user = await User.findOne({ userId, client, role })
    .select("-_id -password -accessToken")
    .populate("client")
    .populate("properties", "name propertyId")
    .lean();
  return {
    success: true,
    user,
  };
};

exports.updateUserInfo = async ({ userId, client, info }) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    contactNumber: Joi.string().required().min(3),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = schema.validate(info);

  if (error) {
    const message = error.details.map((err) => err.message);
    throw new Error(message);
  }

  await User.findOneAndUpdate({ userId, client }, { ...value });

  return {
    success: true,
    message: "Information updated successfully",
  };
};

exports.updateUserStatus = async ({ userId, client }) => {
  const user = await User.findOne({
    userId,
    client,
  });

  if (!user) {
    throw new Error("User not found");
  }
  user.status = user.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
  await user.save();

  return {
    success: true,
    message: "Status updated successfully",
  };
};

exports.updateUserProperties = async ({ userId, client, properties }) => {
  const schema = Joi.object({
    properties: Joi.array().items(Joi.string()),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error } = schema.validate({ properties });

  if (error) {
    const message = error.details.map((err) => err.message);
    throw new Error(message);
  }

  const user = await User.findOne({ userId, client });

  if (!user) {
    throw new Error("User not found");
  }

  const propertiesRemoved = user.properties.filter((prop) => !properties.includes(prop.toString()));
  const propertiesAdded = properties.filter((prop) => !user.properties.includes(prop));

  user.properties = properties;
  await user.save();

  const field =
    user.role === USER_ROLES.MANAGER
      ? "managers"
      : user.role === USER_ROLES.MAINTAINER
      ? "maintainers"
      : user.role === USER_ROLES.JANITOR
      ? "janitors"
      : "tenants";

  await Promise.all(
    propertiesAdded.map(async (prop) => {
      const property = await Property.findById(prop);
      if (!property) return;
      property[field].push(user._id);
      await property.save();
    })
  );

  await Promise.all(
    propertiesRemoved.map(async (prop) => {
      const property = await Property.findById(prop);
      if (!property) return;
      property[field] = property[field].filter((id) => id.toString() !== user._id.toString());
      await property.save();
    })
  );

  return {
    success: true,
    message: "Property updated successfully",
  };
};

exports.updateUserPassword = async ({ userId, client, password }) => {
  const schema = Joi.object({
    password: Joi.string().required().min(8),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = schema.validate({ password });

  if (error) {
    const message = error.details.map((err) => err.message);
    throw new Error(message);
  }

  const user = await User.findOne({ userId, client });

  if (!user) {
    throw new Error("User not found");
  }

  for (let token of user.accessToken) {
    await redisClient.del(`accessToken:${token}`);
  }
  user.accessToken = [];
  user.password = password;

  await user.save();

  return {
    success: true,
    message: "Password updated successfully",
  };
};

exports.deleteUserAccount = async ({ userId, client }) => {
  const user = await User.findOne({ userId, client });

  if (!user) {
    throw new Error("User not found");
  }
  for (let token of user.accessToken) {
    await redisClient.del(`accessToken:${token}`);
  }
  user.status = USER_STATUS.DELETED;

  await user.save();

  return {
    success: true,
    message: "User deleted successfully",
  };
};
