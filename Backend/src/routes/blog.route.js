import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByType,
  updateBlog,
} from "../controllers/blog.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/create", verifyToken, isAdmin, createBlog);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.delete("/delete/:id", verifyToken, isAdmin, deleteBlog);
router.put("/edit/:id", verifyToken, isAdmin, updateBlog);
router.get("/type/:type", getBlogsByType);

export default router;
