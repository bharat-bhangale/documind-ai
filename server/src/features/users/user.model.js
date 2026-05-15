import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { config } from "../../config/env.js";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      select: false
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      index: true
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "local_google"],
      default: "local"
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free"
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.refreshTokens;
        return ret;
      }
    }
  }
);

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, config.passwordSaltRounds);
};

userSchema.methods.comparePassword = async function comparePassword(password) {
  if (!this.passwordHash) {
    return false;
  }

  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);
