const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { customAlphabet } = require("nanoid");
const { USER_ROLES, USER_STATUS, USER_PERMISSIONS } = require("../constants");
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
      enum: Object.keys(USER_ROLES),
      default: USER_ROLES.CLIENT,
    },
    permissions: [
      {
        type: String,
        enum: Object.keys(USER_PERMISSIONS),
      },
    ],

    status: {
      type: String,
      enum: Object.keys(USER_STATUS),
      default: USER_STATUS.NEW,
    },

    client: { type: Schema.Types.ObjectId, ref: "Client" },
    properties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    apartments: [{ type: Schema.Types.ObjectId, ref: "Apartment" }],
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant" },

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
  const token = jwt.sign(
    { id: this._id, userId: this.userId, role: this.role, client: this.client, email: this.email, status: this.status },
    process.env.JWT_SECRET,
    {
      expiresIn: "365d",
    }
  );

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
