import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { config } from "../../config/env.js";
import type { IUser, UserDocument, UserMethods } from "../../types/index.js";

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

const aiUsageSchema = new mongoose.Schema(
  {
    dailyCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastResetAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema<IUser, mongoose.Model<IUser, object, UserMethods>, UserMethods>(
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
    },
    aiUsage: {
      type: aiUsageSchema,
      default: () => ({ dailyCount: 0, lastResetAt: new Date() })
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).passwordHash;
        delete (ret as any).refreshTokens;
        return ret;
      }
    }
  }
);

userSchema.methods.setPassword = async function setPassword(password: string): Promise<void> {
  this.passwordHash = await bcrypt.hash(password, config.passwordSaltRounds);
};

userSchema.methods.comparePassword = async function comparePassword(password: string): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }

  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser, mongoose.Model<IUser, object, UserMethods>>("User", userSchema);
