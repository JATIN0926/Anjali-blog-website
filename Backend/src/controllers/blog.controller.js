import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @desc    Create new blog
// @route   POST /api/blogs
export const createBlog = async (req, res) => {
  try {
    const { title, content, tags, type, uid, thumbnail } = req.body;

    if (!title || !content || !uid) {
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const blogUid = crypto.randomBytes(6).toString("hex");

    let lastDiary = null;

    if (type === "Diary") {
      lastDiary = await Blog.findOne({ type: "Diary" }).sort({ createdAt: -1 });
    }

    const newBlog = await Blog.create({
      uid: blogUid,
      title,
      content,
      tags,
      type,
      thumbnail,
      user: user._id,
    });

    if (type === "Diary" && lastDiary) {
      lastDiary.next = newBlog._id;
      await lastDiary.save();
    }

    return res.status(201).json(
      new ApiResponse(201, {
        message: "Blog created successfully",
        blog: newBlog,
      })
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

// @desc    Get all blogs
// @route   GET /api/blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, blogs));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json(new ApiError(404, "Blog not found"));
    }
    return res.status(200).json(new ApiResponse(200, blog));
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, tags, type, thumbnail } = req.body;

    if (!title || !content || !tags || !type) {
      throw new ApiError(400, "All fields are required.");
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new ApiError(404, "Blog not found.");
    }

    blog.title = title;
    blog.content = content;
    blog.tags = tags;
    blog.type = type;
    blog.thumbnail = thumbnail;

    const updatedBlog = await blog.save();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedBlog, "Blog updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const getBlogsByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!type || !["Article", "Diary"].includes(type)) {
      return res
        .status(400)
        .json(new ApiError(400, "Type must be 'article' or 'myDiary'"));
    }

    const blogs = await Blog.find({ type }).sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, blogs, `Fetched ${type} blogs successfully`));
  } catch (error) {
    console.error("Error fetching blogs by type:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};
