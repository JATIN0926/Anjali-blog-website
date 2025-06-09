// src/routes/userRoutes.js
import express from "express";
import { loginWithOneTap } from "../controllers/user.controller.js";

const router = express.Router();
router.post("/google-onetap", loginWithOneTap);

export default router;
