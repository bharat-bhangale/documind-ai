import { Router } from "express";

import { handlePaymentWebhook } from "./payment.controller.js";

const router = Router();

router.post("/", handlePaymentWebhook);

export default router;
