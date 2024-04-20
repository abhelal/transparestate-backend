const { USER_ROLES, USER_STATUS } = require("../constants");
const User = require("../models/userModel");

exports.createSuperAdmin = async () => {
  try {
    const superAdmin = await User.findOne({ role: USER_ROLES.SUPERADMIN }).lean();
    if (!superAdmin) {
      console.log("No superadmin found!");
      console.log("Creating superadmin .....");
      const newSuperAdmin = new User({
        name: "Super Admin",
        email: "superadmin@gmail.com",
        password: "12345678",
        role: USER_ROLES.SUPERADMIN,
        status: USER_STATUS.ACTIVE,
      });
      await newSuperAdmin.save();
      console.log("Superadmin created !");
    }
  } catch (error) {
    console.log("Error creating superadmin !!!");
  }
  console.log("Application Superadmin is OK");
};
