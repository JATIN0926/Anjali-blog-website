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

export default router;
