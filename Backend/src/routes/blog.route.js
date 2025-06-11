import express from "express";
import { createBlog, getAllBlogs,getBlogById } from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/create", createBlog);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

export default router;
