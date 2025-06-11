import express from "express";
import { loginWithOneTap, logout } from "../controllers/user.controller.js";

const router = express.Router();
router.post("/google-onetap", loginWithOneTap);
router.post("/logout", logout);

export default router;
