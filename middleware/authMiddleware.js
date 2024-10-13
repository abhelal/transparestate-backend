const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { USER_ROLES } = require("../constants");
const { name } = require("../routes/v1/maintenanceRoutes");

const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1] || null;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "No Access Token! Sorry you are not authorized",
      });
    }

    const secret = process.env.JWT_SECRET;
    const decodedUser = jwt.verify(accessToken, secret);
    const isExpired = Date.now() >= decodedUser.exp * 1000;
    const user = await User.findById(decodedUser.id).populate("client", "isSubscribed");

    if (!user) {
      return res
        .status(409)
        .clearCookie("accessToken", {
          httpOnly: true,
          secure: true,
          domain: process.env.DOMAIN,
        })
        .json({
          success: false,
          message: "Account not found",
        });
    }

    if (isExpired) {
      user.accessToken = user.accessToken.filter((token) => token !== accessToken);
      await user.save();

      return res
        .status(401)
        .clearCookie("accessToken", {
          httpOnly: true,
          secure: true,
          domain: process.env.DOMAIN,
        })
        .json({
          success: false,
          message: "Sorry your session has expired",
        });
    }

    req.id = user._id;
    req.userId = user.userId;
    req.role = user.role;
    req.email = user.email;
    req.name = user?.name || "";
    req.status = user.status;
    req.permissions = user.permissions;
    req.client = user.role === USER_ROLES.SUPERADMIN ? "" : user.client._id;
    req.isSubscribed = user.role === USER_ROLES.SUPERADMIN ? true : user.client.isSubscribed;

    return next();
  } catch (error) {
    console.log("protectRoute - error", error);
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

const denyAccess = (roles = []) => {
  return (req, res, next) => {
    if (roles.includes(req.role)) return res.status(401).json({ message: "Sorry you are not authorized" });
    next();
  };
};

const permissionCheck = (permission = "") => {
  return (req, res, next) => {
    if (req.role === USER_ROLES.CLIENT) return next();
    const permissions = req?.permissions || [];
    if (!permissions.includes(permission)) return res.status(401).json({ message: "Sorry you do not have permission" });
    next();
  };
};

module.exports = { protectRoute, allowAccess, denyAccess, permissionCheck };
