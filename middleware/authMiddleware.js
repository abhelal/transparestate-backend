const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { USER_STATUS } = require("../constants");
const client = require("../config/redis");

const protectRoute = async (req, res, next) => {
  const { refreshToken, accessToken } = req.cookies;
  let isValid = false;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Sorry you are not authorized",
    });
  }

  if (!refreshToken)
    return res.status(401).clearCookie("accessToken").clearCookie("refreshToken").json({
      success: false,
      message: "Sorry you are not authorized",
    });

  if (accessToken) {
    const secret = process.env.JWT_SECRET;
    const user = jwt.verify(accessToken, secret);
    isValid = (await client.GET(`accessToken:${accessToken}`)) === user.userId.toString();

    if (isValid) {
      req.userId = user.userId;
      req.role = user.role;
      return next();
    }
  }

  if ((!accessToken || !isValid) && refreshToken) {
    const userFromDb = await User.findOne({
      refreshToken: refreshToken,
      status: USER_STATUS.ACTIVE,
    });

    if (!userFromDb) {
      return res.status(401).clearCookie("accessToken").clearCookie("refreshToken").json({
        success: false,
        message: "Sorry you are not authorized",
      });
    }

    const newAccessToken = await userFromDb.generateAuthToken();
    const newRefreshToken = await userFromDb.generateRefreshToken();

    await userFromDb.save();

    console.log("cokie refreshed");
    res.cookie("accessToken", newAccessToken, {
      maxAge: 60 * 60 * 1000,
      sameSite: "Lax",
      httpOnly: true,
      secure: false,
      domain: req.hostname,
      path: "/",
      Partitioned: true,
    });

    res.cookie("refreshToken", newRefreshToken, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      sameSite: "Lax",
      httpOnly: true,
      secure: false,
      domain: req.hostname,
      path: "/",
      Partitioned: true,
    });

    req.userId = userFromDb.userId;
    req.role = userFromDb.role;

    return next();
  }

  return res.status(401).clearCookie("accessToken").clearCookie("refreshToken").json({
    success: false,
    message: "Sorry you are not authorized",
  });
};

const allowAccess = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(401).json({ message: "Sorry you are not authorized" });
    next();
  };
};

module.exports = { protectRoute, allowAccess };
