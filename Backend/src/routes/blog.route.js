import express from "express";
import { createBlog, getAllBlogs } from "../controllers/blog.controller.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.post("/create", createBlog);

export default router;
