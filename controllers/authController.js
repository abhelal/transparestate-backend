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
  const user = await User.findOne({ email: email });

  if (user) {
    return res.status(409).json({
      success: false,
      message: "Email already exists",
    });
  }

  const client = await Client.create({});

  const newUser = new User({
    name,
    email,
    password,
    role: USER_ROLES.CLIENT,
    status: USER_STATUS.NEW,
    client: client._id,
  });

  await newUser.save();
  const token = await newUser.generateAuthToken();
  await newUser.save();

  return res
    .status(201)
    .cookie("accessToken", token, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      sameSite: "Lax",
      httpOnly: true,
      secure: false,
      domain: req.hostname,
      path: "/",
      Partitioned: true,
    })
    .json({
      success: true,
      message: "Company registered successfully",
      user: {
        userId: newUser.userId,
        status: newUser.status,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
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

  const user = await User.findOne({ email: email });

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
          sameSite: "Lax",
          httpOnly: true,
          secure: false,
          domain: req.hostname,
          path: "/",
          Partitioned: true,
        })
        .json({
          success: true,
          message: "Login successfully",
          user: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
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
  const user = await User.findOne({ userId: req.userId }).lean();

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "User not found",
    });
  } else {
    return res.status(200).json({
      success: true,
      message: "User details",
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  }
};
