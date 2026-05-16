import mongoose from "mongoose";

import type { IDocument } from "../../types/index.js";

const documentSchema = new mongoose.Schema<IDocument>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 160
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1
    },
    pageCount: {
      type: Number,
      required: true,
      min: 0
    },
    extractedText: {
      type: String,
      required: true
    },
    textLength: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["ready"],
      default: "ready"
    },
    summary: {
      type: String,
      default: ""
    },
    summaryGeneratedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

documentSchema.index({ owner: 1, createdAt: -1 });

export const Document = mongoose.model<IDocument>("Document", documentSchema);
