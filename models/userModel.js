const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { customAlphabet } = require("nanoid");
const { USER_ROLES, USER_STATUS } = require("../constants");
const client = require("../config/redis");

const userSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      default: () => {
        const nanoid = customAlphabet("1234567890", 10);
        return nanoid();
      },
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    contactNumber: {
      type: String,
    },
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        USER_ROLES.SUPERADMIN,
        USER_ROLES.CLIENT,
        USER_ROLES.MAINTAINER,
        USER_ROLES.JANITOR,
        USER_ROLES.TENANT,
      ],
      default: USER_ROLES.CLIENT,
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },

    client: { type: Schema.Types.ObjectId, ref: "Client" },
    properties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    apartments: [{ type: Schema.Types.ObjectId, ref: "Apartment" }],
    tenant: { type: Schema.Types.ObjectId, ref: "Tenants" },

    status: {
      type: String,
      enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.DELETED],
      default: USER_STATUS.INACTIVE,
    },
    accessToken: [String],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ userId: this.userId, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

  if (this.accessToken.length >= 5) {
    this.accessToken.shift();
  }
  this.accessToken.push(token);
  await client.set(`accessToken:${token}`, this.userId.toString(), { EX: 365 * 24 * 60 * 60 });
  return token;
};

userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
