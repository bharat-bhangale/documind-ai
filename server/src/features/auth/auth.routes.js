import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest.js";
import { googleLogin, login, logout, me, refresh, register } from "./auth.controller.js";
import { googleLoginSchema, loginSchema, registerSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/google", validateRequest(googleLoginSchema), googleLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", me);

export default router;

