import mongoose from "mongoose";

import { PAYMENT_PLAN, PAYMENT_PROVIDER, PAYMENT_SOURCE, PAYMENT_STATUS } from "./payment.constants.js";
import type { IPayment } from "../../types/index.js";

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    plan: {
      type: String,
      enum: Object.values(PAYMENT_PLAN),
      default: PAYMENT_PLAN.PRO,
      required: true
    },
    provider: {
      type: String,
      enum: Object.values(PAYMENT_PROVIDER),
      default: PAYMENT_PROVIDER.RAZORPAY,
      required: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3
    },
    receipt: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CREATED,
      required: true,
      index: true
    },
    source: {
      type: String,
      enum: Object.values(PAYMENT_SOURCE),
      default: PAYMENT_SOURCE.CHECKOUT,
      required: true
    },
    paidAt: {
      type: Date
    },
    failedAt: {
      type: Date
    },
    webhookEventIds: {
      type: [String],
      default: [],
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).webhookEventIds;
        return ret;
      }
    }
  }
);

paymentSchema.index({ user: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
