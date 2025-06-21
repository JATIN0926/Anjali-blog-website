import express from "express";
import { getLatestNotifications } from "../controllers/notification.controller.js";
import isAdmin from "../middlewares/isAdmin.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/latest", verifyToken, isAdmin, getLatestNotifications);

export default router;
