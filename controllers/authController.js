const User = require("../models/userModel");
const Joi = require("joi");
const { USER_STATUS } = require("../constants");
const client = require("../config/redis");
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

  const user = await User.findOne({ email: email, status: USER_STATUS.ACTIVE });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Email not exists",
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
      const refreshToken = await user.generateRefreshToken();

      await user.save();
      return res
        .status(200)
        .cookie("accessToken", token, {
          maxAge: 60 * 60 * 1000,
          sameSite: "Lax",
          httpOnly: true,
          secure: false,
          domain: req.hostname,
          path: "/",
          Partitioned: true,
        })
        .cookie("refreshToken", refreshToken, {
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
          token: token,
          refreshToken: refreshToken,
        });
    }
  }
};

exports.logout = async (req, res) => {
  const { refreshToken, accessToken } = req.cookies;

  if (!refreshToken) {
    return res.status(409).json({
      success: false,
      message: "You are not loggedin",
    });
  }

  const user = await User.findOne({ refreshToken: refreshToken });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Invalid refresh token",
    });
  } else {
    user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
    user.accessToken = user.accessToken.filter((token) => token !== accessToken);
    await client.del(`accessToken:${accessToken}`);
    await user.save();
    return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json({
      success: true,
      message: "Successfully logout",
    });
  }
};

exports.logoutAll = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(409).json({
      success: false,
      message: "You are not loggedin",
    });
  }

  const user = await User.findOne({ refreshToken: refreshToken });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Invalid refresh token",
    });
  } else {
    user.refreshToken = [];
    user.accessToken = [];
    await user.save();
    return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json({
      success: true,
      message: "Successfully logout from all devices",
    });
  }
};

exports.logoutOthers = async (req, res) => {
  const { refreshToken, accessToken } = req.cookies;

  if (!refreshToken) {
    return res.status(409).json({
      success: false,
      message: "You are not loggedin",
    });
  }

  const user = await User.findOne({ refreshToken: refreshToken });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Invalid refresh token",
    });
  } else {
    user.accessToken.map(async (token) => {
      if (token !== accessToken) {
        await client.del(`accessToken:${token}`);
      }
    });
    user.refreshToken = [refreshToken];
    user.accessToken = [accessToken];
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Successfully logout from other devices",
    });
  }
};

exports.me = async (req, res) => {
  const user = await User.findOne({ userId: req.userId });

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
      },
    });
  }
};
