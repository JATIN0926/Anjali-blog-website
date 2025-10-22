import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByStatus,
  getBlogsByStatusAndType,
  getBlogsByType,
  toggleBlogLike,
  updateBlog,
  createEmptyDraft,
  updateDraftById,
  deleteDraftById,
  subscribeUser,
  getRecommendedBlogs,
} from "../controllers/blog.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/create", verifyToken, isAdmin, createBlog);
router.get("/", getAllBlogs);
router.get("/status-type", getBlogsByStatusAndType);
router.get("/status/:status", getBlogsByStatus);
router.delete("/delete/:id", verifyToken, isAdmin, deleteBlog);
router.put("/edit/:id", verifyToken, isAdmin, updateBlog);
router.get("/type/:type", getBlogsByType);
router.get("/:id", getBlogById);
router.put("/toggle-like/:id", verifyToken, toggleBlogLike);
router.post("/draft", verifyToken, createEmptyDraft);
router.put("/draft/:id", verifyToken, updateDraftById);
router.delete("/draft/:id", verifyToken, deleteDraftById);
router.post("/subscribe", verifyToken, subscribeUser);
router.get("/:id/recommendations", getRecommendedBlogs);

export default router;
