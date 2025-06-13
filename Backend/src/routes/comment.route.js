// comment.route.js
import express from "express";
import {
  createComment,
  getCommentsByBlogId,
  editComment,
  deleteComment,
  toggleLike,
  replyToComment,
} from "../controllers/comment.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createComment);
router.get("/:blogId", getCommentsByBlogId);
router.put("/edit/:id", verifyToken, editComment);
router.delete("/delete/:id", verifyToken, deleteComment);
router.put("/toggle-like/:id", verifyToken, toggleLike);
router.post("/reply", verifyToken, replyToComment);

export default router;
