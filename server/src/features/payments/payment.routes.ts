import { Router } from "express";

import { createPaymentOrder, getPaymentHistory, verifyPayment } from "./payment.controller.js";

const router = Router();

router.post("/orders", createPaymentOrder);
router.post("/verify", verifyPayment);
router.get("/history", getPaymentHistory);

export default router;
