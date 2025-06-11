import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";

export const createBlog = async (req, res) => {
  try {
    const { title, content, tags, type, uid, thumbnail } = req.body;

    if (!title || !content || !uid) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    res
      .status(201)
      .json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all blogs
// @route   GET /api/blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Server error" });
  }
};
