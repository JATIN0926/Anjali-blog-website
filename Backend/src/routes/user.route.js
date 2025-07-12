import express from "express";
import {
  getCurrentUser,
  loginWithFirebase,
  loginWithOneTap,
  logout,
  updateSocialLinks,
} from "../controllers/user.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";
const router = express.Router();
router.post("/google-onetap", loginWithOneTap);
router.post("/google-popup", loginWithFirebase);
router.post("/logout", logout);
router.patch("/socials", verifyToken, isAdmin, updateSocialLinks);
router.get("/me", verifyToken, getCurrentUser);

export default router;
