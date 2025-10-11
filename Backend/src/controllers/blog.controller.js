import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendBrevoMail } from "../utils/email.js";
import { diaryWelcomeMail } from "../email-templates/welcomeDiary.js";
import { socialWelcomeMail } from "../email-templates/welcomeSocial.js";
import { bothWelcomeMail } from "../email-templates/welcomeBoth.js";

// @desc    Create new blog
// @route   POST /api/blogs
export const createBlog = async (req, res) => {
  try {
    const { title, content, tags, type, uid, thumbnail, status } = req.body;

    if (!title || !content || !uid) {
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }

    if (status && !["Draft", "Published"].includes(status)) {
      return res.status(400).json(new ApiError(400, "Invalid blog status"));
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
      status: status || "Draft",
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
    const { title, content, tags, type, thumbnail, status } = req.body;

    if (!title || !content || !tags || !type) {
      throw new ApiError(400, "All fields are required.");
    }

    if (status && !["Draft", "Published"].includes(status)) {
      throw new ApiError(400, "Invalid blog status.");
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
    blog.status = status || blog.status;

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
        .json(new ApiError(400, "Type must be 'Article' or 'Diary'"));
    }

    const blogs = await Blog.find({ type, status: "Published" }).sort({
      createdAt: -1,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          blogs,
          `Fetched published ${type} blogs successfully`
        )
      );
  } catch (error) {
    console.error("Error fetching blogs by type:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

// @desc    Get blogs by status (Draft / Published)
// @route   GET /api/blogs/status/:status
export const getBlogsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json(new ApiError(400, "Invalid status"));
    }

    const blogs = await Blog.find({ status }).sort({ updatedAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, blogs, `Fetched ${status} blogs`));
  } catch (error) {
    console.error("Error fetching blogs by status:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};
// @desc    Get blogs by status and type
// @route   GET /api/blogs/status-type?status=Published&type=Diary
export const getBlogsByStatusAndType = async (req, res) => {
  try {
    const { status, type } = req.query;

    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json(new ApiError(400, "Invalid status"));
    }

    if (!["Diary", "Article"].includes(type)) {
      return res.status(400).json(new ApiError(400, "Invalid type"));
    }

    const blogs = await Blog.find({ status, type }).sort({ updatedAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, blogs, `Fetched ${status} ${type} blogs`));
  } catch (error) {
    console.error("Error fetching blogs by status and type:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const toggleBlogLike = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user._id; // You must have `authenticateUser` middleware to populate this

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new ApiError(404, "Blog not found");
    }

    const index = blog.likes.indexOf(userId);
    if (index === -1) {
      blog.likes.push(userId); // Like
    } else {
      blog.likes.splice(index, 1); // Unlike
    }

    await blog.save();

    return res
      .status(200)
      .json(new ApiResponse(200, { likes: blog.likes }, "Blog like toggled"));
  } catch (error) {
    console.error("Like toggle failed:", error);
    return res.status(500).json(new ApiError(500, "Failed to toggle like"));
  }
};

export const createEmptyDraft = async (req, res) => {
  try {
    const { title, content, tags, type, thumbnail, status, uid } = req.body;

    if (!uid) {
      throw new ApiError(400, "UID is required");
    }

    const user = await User.findOne({ uid });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const draft = await Blog.create({
      title,
      content,
      tags,
      type,
      thumbnail,
      uid,
      user: user._id,
      status,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, draft, "Initial draft created"));
  } catch (error) {
    console.error("Initial Draft Error:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const updateDraftById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, type, thumbnail, status } = req.body;

    const draft = await Blog.findById(id);

    if (!draft) {
      throw new ApiError(404, "Draft not found");
    }

    if (draft.status !== "Draft") {
      throw new ApiError(400, "Only drafts can be updated using this route");
    }

    draft.title = title || "";
    draft.content = content || "";
    draft.tags = tags || [];
    draft.type = type || "Not Set";
    draft.thumbnail = thumbnail || "";
    draft.status = status || "Draft";

    const updatedDraft = await draft.save();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedDraft, "Draft updated successfully"));
  } catch (error) {
    console.error("Update Draft Error:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const deleteDraftById = async (req, res) => {
  try {
    const { id } = req.params;

    const draft = await Blog.findById(id);
    if (!draft) throw new ApiError(404, "Draft not found");

    if (draft.status !== "Draft") {
      throw new ApiError(400, "Only drafts can be deleted via this route");
    }

    await Blog.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Draft deleted successfully"));
  } catch (error) {
    console.error("Delete Draft Error:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const subscribeUser = async (req, res) => {
  try {
    const { email, subscribeTo } = req.body;

    if (!email || !subscribeTo) {
      throw new ApiError(400, "Email and subscription category required");
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    let alreadySubscribed = true;

    // Check existing subs
    if (subscribeTo.social && !user.subscriptions.includes("Article")) {
      alreadySubscribed = false;
    }
    if (subscribeTo.diary && !user.subscriptions.includes("Diary")) {
      alreadySubscribed = false;
    }

    if (alreadySubscribed) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { subscriptions: user.subscriptions },
            "Already subscribed"
          )
        );
    }

    let updatedSubs = [...user.subscriptions];
    if (subscribeTo.social && !updatedSubs.includes("Article")) {
      updatedSubs.push("Article");
    }
    if (subscribeTo.diary && !updatedSubs.includes("Diary")) {
      updatedSubs.push("Diary");
    }
    user.subscriptions = updatedSubs;
    await user.save();

    let mailContent;
    if (subscribeTo.social && subscribeTo.diary) {
      mailContent = bothWelcomeMail(user.name);
    } else if (subscribeTo.social) {
      mailContent = socialWelcomeMail(user.name);
    } else if (subscribeTo.diary) {
      mailContent = diaryWelcomeMail(user.name);
    }

    if (mailContent) {
      await sendBrevoMail({
        to: email,
        subject: mailContent.subject,
        html: mailContent.html,
      });
      
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscriptions: user.subscriptions },
          "Subscribed successfully"
        )
      );
  } catch (err) {
    console.error("❌ Subscription failed:", err);
    return res
      .status(err.statusCode || 500)
      .json(
        new ApiError(
          err.statusCode || 500,
          err.message || "Subscription failed"
        )
      );
  }
};
