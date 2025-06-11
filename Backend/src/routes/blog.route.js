import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
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

export default router;
