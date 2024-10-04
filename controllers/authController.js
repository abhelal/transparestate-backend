const User = require("../models/userModel");
const Client = require("../models/clientModel");

const Joi = require("joi");
const { USER_ROLES, USER_STATUS } = require("../constants");
const client = require("../config/redis");

// register user

exports.register = async (req, res) => {
  const objectSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .lowercase()
      .trim()
      .min(3)
      .max(255)
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
    companyName: Joi.string().optional(),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = objectSchema.validate(req.body);

  if (error) {
    return res.status(409).json({
      success: false,
      message: "Invalid form data",
      errorMessage: error.message,
    });
  }
  const { name, email, password } = value;
  const isExits = await User.findOne({ email: email });

  if (isExits) {
    return res.status(409).json({
      success: false,
      message: "Email already exists",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: USER_ROLES.CLIENT,
    status: USER_STATUS.NEW,
    permissions: [],
  });

  const client = await Client.create({
    owner: user._id,
    companyName: value.companyName,
    isSubscribed: false,
  });

  const userWithClient = await User.findOneAndUpdate({ _id: user._id }, { client: client._id }, { new: true }).populate(
    "client",
    "isSubscribed"
  );

  const token = await userWithClient.generateAuthToken();
  await userWithClient.save();

  return res
    .status(201)
    .cookie("accessToken", token, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      domain: process.env.DOMAIN,
    })
    .json({
      success: true,
      message: "Client registered successfully",
      user: {
        id: userWithClient._id,
        userId: userWithClient.userId,
        status: userWithClient.status,
        name: userWithClient.name,
        email: userWithClient.email,
        role: userWithClient.role,
        permissions: userWithClient.permissions,
        client: userWithClient.client._id,
        isSubscribed: userWithClient.client.isSubscribed,
      },
    });
};

// login user

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error } = objectSchema.validate({ email, password });

  if (error) {
    return res.status(409).json({
      success: false,
      message: "Invalid/Missing credentials.",
      errorMessage: error.message,
    });
  }

  const user = await User.findOne({ email: email }).populate("client", "isSubscribed");

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Account not found",
    });
  } else {
    const isMatch = await user.verifyPassword(password);

    if (!isMatch) {
      return res.status(409).json({
        success: false,
        message: "Incorrect password",
      });
    } else {
      const token = await user.generateAuthToken();
      await user.save();

      return res
        .status(200)
        .cookie("accessToken", token, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: true,
          domain: process.env.DOMAIN,
        })
        .json({
          success: true,
          message: "Login successfully",
          user: {
            id: user._id,
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            permissions: user.permissions,
            client: user.role === USER_ROLES.SUPERADMIN ? "" : user.client._id,
            isSubscribed: user.role === USER_ROLES.SUPERADMIN ? true : user.client.isSubscribed,
          },
        });
    }
  }
};

exports.logout = async (req, res) => {
  const { accessToken } = req.cookies;
  const user = await User.findOne({ userId: req.userId });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Account not found",
    });
  } else {
    user.accessToken = user.accessToken.filter((token) => token !== accessToken);
    await client.del(`accessToken:${accessToken}`);
    await user.save();
    return res.status(200).clearCookie("accessToken").json({
      success: true,
      message: "Successfully logout",
    });
  }
};

exports.logoutAll = async (req, res) => {
  const user = await User.findOne({ userId: req.userId });
  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Account not found",
    });
  } else {
    for (let token of user.accessToken) {
      await client.del(`accessToken:${token}`);
    }
    user.accessToken = [];
    await user.save();
    return res.status(200).clearCookie("accessToken").json({
      success: true,
      message: "Successfully logout from all devices",
    });
  }
};

exports.logoutOthers = async (req, res) => {
  const { accessToken } = req.cookies;
  const user = await User.findOne({ userId: req.userId });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Account not found",
    });
  } else {
    for (let token of user.accessToken) {
      if (token !== accessToken) {
        await client.del(`accessToken:${token}`);
      }
    }

    user.accessToken = [accessToken];
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Successfully logout from other devices",
    });
  }
};

exports.me = async (req, res) => {
  const user = await User.findOne({ userId: req.userId }).populate("client", "isSubscribed");

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Account not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "User details",
    user: {
      id: user._id,
      userId: user.userId,
      role: user.role,
      client: user.client,
      email: user.email,
      status: user.status,
      permissions: user.permissions,
      isSubscribed: user.role === USER_ROLES.SUPERADMIN ? true : user.client.isSubscribed,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
};

exports.getAddress = async (req, res) => {
  const user = await User.findOne({ userId: req.userId });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Account not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "User address",
    address: {
      contactNumber: user.contactNumber,
      street: user.street,
      buildingNo: user.buildingNo,
      zipCode: user.zipCode,
      city: user.city,
      country: user.country,
    },
  });
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findOne({ userId: req.userId });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Account not found",
    });
  }

  const isMatch = await user.verifyPassword(currentPassword);

  if (!isMatch) {
    return res.status(409).json({
      success: false,
      message: "Incorrect current password",
    });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(409).json({
      success: false,
      message: "Password mismatch",
    });
  }

  user.password = newPassword;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};

exports.updateAddress = async (req, res) => {
  const objectSchema = Joi.object({
    contactNumber: Joi.string().required(),
    street: Joi.string().required(),
    buildingNo: Joi.string().required(),
    zipCode: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
  }).options({ stripUnknown: true, abortEarly: false });

  const { error, value } = objectSchema.validate(req.body);

  if (error) {
    return res.status(409).json({
      success: false,
      message: "Invalid form data",
      errorMessage: error.message,
    });
  }

  const user = await User.findOne({ userId: req.userId });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Account not found",
    });
  }

  user.contactNumber = value.contactNumber;
  user.street = value.street;
  user.buildingNo = value.buildingNo;
  user.zipCode = value.zipCode;
  user.city = value.city;
  user.country = value.country;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Address updated successfully",
  });
};
