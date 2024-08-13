const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const client = require("../config/redis");

const protectRoute = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "No Access Token! Sorry you are not authorized",
      });
    }

    if (accessToken) {
      const secret = process.env.JWT_SECRET;
      const user = jwt.verify(accessToken, secret);
      const isValid = (await client.GET(`accessToken:${accessToken}`)) === user.userId.toString();

      if (user && isValid) {
        req.user = user;
        req.id = user.id;
        req.userId = user.userId;
        req.role = user.role;
        req.client = user.client;
        req.email = user.email;
        req.status = user.status;
        return next();
      } else {
        const dbuser = await User.findOne({ userId: user.userId });
        if (!dbuser) {
          return res.status(409).clearCookie("accessToken").json({
            success: false,
            message: "Account not found",
          });
        } else {
          dbuser.accessToken = dbuser.accessToken.filter((token) => token !== accessToken);
          await user.save();
          return res.status(401).clearCookie("accessToken").json({
            success: false,
            message: "Sorry you are not authorized",
          });
        }
      }
    }
  } catch (error) {
    return res.status(401).clearCookie("accessToken").json({
      success: false,
      message: "Sorry you are not authorized",
    });
  }
};

const allowAccess = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) return res.status(401).json({ message: "Sorry you are not authorized" });
    next();
  };
};

module.exports = { protectRoute, allowAccess };
