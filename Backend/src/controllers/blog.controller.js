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
      return res
        .status(400)
        .json(new ApiError(400, "Missing required fields"));
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const blogUid = crypto.randomBytes(6).toString("hex");

    const newBlog = await Blog.create({
      uid: blogUid,
      title,
      content,
      tags,
      type,
      thumbnail,
      user: user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { message: "Blog created successfully", blog: newBlog }));
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
