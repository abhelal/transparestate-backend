// User Roles

const USER_ROLES = {
  OWNER: "OWNER",
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  MAINTAINER: "MAINTAINER",
  TENANTS: "TENANTS",
};

// User Status
const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DELETED: "DELETED",
};

// User Permissions
const USER_PERMISSIONS = {
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",
  VIEW_PROPERTIES: "view_properties",
  CREATE_PROPERTIES: "create_properties",
  EDIT_PROPERTIES: "edit_properties",
  DELETE_PROPERTIES: "delete_properties",
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  USER_PERMISSIONS,
};
