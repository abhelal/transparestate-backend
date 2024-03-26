// User Roles

const USER_ROLES = {
  SUPERADMIN: "SUPERADMIN",
  CLIENT: "CLIENT",
  ADMIN: "ADMIN",
  MAINTAINER: "MAINTAINER",
  TENANT: "TENANT",
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

const PROPERTY_TYPE = {
  APARTMENT: "apartment",
  OFFICE_BUILDING: "office_building",
  HOUSE: "house",
  WAREHOUSE: "warehouse",
};

// Maintenance Status
const MAINTENANCE_STATUS = {
  PENDING: "PENDING",
  INPROGRESS: "INPROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  USER_PERMISSIONS,
  PROPERTY_TYPE,
  MAINTENANCE_STATUS,
};
