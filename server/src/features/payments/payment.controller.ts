import type { Request, Response } from "express";

import { requireAuth } from "../../middleware/requireAuth.js";
import { validateQuery, validateRequest } from "../../middleware/validateRequest.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createProPaymentOrder,
  listPaymentHistory,
  processRazorpayWebhook,
  verifyProPayment
} from "./payment.service.js";
import { listPaymentsQuerySchema, verifyPaymentSchema } from "./payment.validation.js";

export const createPaymentOrder = [
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await createProPaymentOrder({ user: req.user! });

    res.status(201).json({
      success: true,
      data: result
    });
  })
];

export const verifyPayment = [
  requireAuth,
  validateRequest(verifyPaymentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await verifyProPayment({
      user: req.user!,
      orderId: req.body.razorpay_order_id,
      paymentId: req.body.razorpay_payment_id,
      signature: req.body.razorpay_signature
    });

    res.status(200).json({
      success: true,
      data: result
    });
  })
];

export const getPaymentHistory = [
  requireAuth,
  validateQuery(listPaymentsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await listPaymentHistory({
      userId: req.auth!.userId,
      query: req.query
    });

    res.status(200).json({
      success: true,
      data: result
    });
  })
];

export const handlePaymentWebhook = asyncHandler(async (req: Request, res: Response) => {
  const result = await processRazorpayWebhook({
    rawBody: req.body,
    signature: req.get("x-razorpay-signature"),
    eventId: req.get("x-razorpay-event-id") || null
  });

  res.status(200).json({
    success: true,
    data: result
  });
});
