import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import pLimit from "p-limit";
import redisClient from "../redis/redisClient.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendBrevoMail } from "../utils/email.js";
import { diaryWelcomeMail } from "../email-templates/welcomeDiary.js";
import { socialWelcomeMail } from "../email-templates/welcomeSocial.js";
import { bothWelcomeMail } from "../email-templates/welcomeBoth.js";
import { getNewBlogMailContent } from "../email-templates/getNewBlogMailContent.js";

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

    res.status(201).json(
      new ApiResponse(201, {
        message: "Blog created successfully",
        blog: newBlog,
      })
    );

    if (newBlog.status === "Published") {
      const cacheKey = `blogs_${newBlog.type}`;
      console.log(
        `🧹 Clearing Redis cache for ${cacheKey} due to new blog creation!`
      );

      try {
        const result = await redisClient.del(cacheKey);
        console.log(`Deleted key ${cacheKey}:`, result); // 1 if deleted, 0 if not
      } catch (err) {
        console.error(`Failed to delete key ${cacheKey}:`, err);
      }
    }

    if (newBlog.status === "Published") {
      setImmediate(async () => {
        try {
          const subscribers = await User.find({
            $or: [
              { subscriptions: type },
              { subscriptions: { $all: ["Article", "Diary"] } },
            ],
          }).select("email");

          if (!subscribers.length) return;

          console.log(
            `📨 Sending new blog notification to ${subscribers.length} users`
          );

          const mailContent = getNewBlogMailContent(newBlog);

          const limit = pLimit(5);

          const tasks = subscribers.map((subUser) =>
            limit(() =>
              sendBrevoMail({
                to: subUser.email,
                subject: mailContent.subject,
                html: mailContent.html,
              }).catch((err) =>
                console.error(
                  `❌ Failed to send mail to ${subUser.email}: ${err.message}`
                )
              )
            )
          );

          await Promise.allSettled(tasks);
          console.log("✅ All subscriber emails processed");
        } catch (err) {
          console.error("❌ Background mail task failed:", err);
        }
      });
    }
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json(new ApiError(500, "Failed to Post Blog"));
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

    const cacheKey = `blogs_${deletedBlog.type}`;
    try {
      const result = await redisClient.del(cacheKey);
      console.log(`🧹 Redis cache cleared for ${cacheKey} (deleted blog):`, result);
    } catch (err) {
      console.error(`❌ Failed to clear Redis cache for ${cacheKey}:`, err);
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

    const keysToDelete = ["blogs_Article", "blogs_Diary"];
    for (const key of keysToDelete) {
      try {
        const result = await redisClient.del(key);
        console.log(`Deleted key ${key}:`, result); // 1 if deleted, 0 if not
      } catch (err) {
        console.error(`Failed to delete key ${key}:`, err);
      }
    }

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

    const cacheKey = `blogs_${type}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Serving ${type} blogs from Redis cache`);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            JSON.parse(cachedData),
            `Fetched published ${type} blogs (from cache)`
          )
        );
    }


    const blogs = await Blog.find({ type, status: "Published" })
      .select("title thumbnail datePosted _id")
      .sort({
        createdAt: -1,
      });


    await redisClient.setEx(cacheKey, 86400, JSON.stringify(blogs));
    console.log(`🧠 Cached ${type} blogs in Redis`);

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

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    let updatedSubs = [...user.subscriptions];
    let newlyAdded = [];

    // Handle "Article" (social)
    if (subscribeTo.social && !updatedSubs.includes("Article")) {
      updatedSubs.push("Article");
      newlyAdded.push("Article");
    }

    // Handle "Diary"
    if (subscribeTo.diary && !updatedSubs.includes("Diary")) {
      updatedSubs.push("Diary");
      newlyAdded.push("Diary");
    }

    // If nothing new added → user was already subscribed to all requested types
    if (newlyAdded.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { subscriptions: user.subscriptions },
            "Already subscribed to selected categories"
          )
        );
    }

    // Save only if there's an update
    user.subscriptions = updatedSubs;
    await user.save();

    // Choose correct welcome mail
    let mailContent;
    if (newlyAdded.includes("Article") && newlyAdded.includes("Diary")) {
      mailContent = bothWelcomeMail(user.name);
    } else if (newlyAdded.includes("Article")) {
      mailContent = socialWelcomeMail(user.name);
    } else if (newlyAdded.includes("Diary")) {
      mailContent = diaryWelcomeMail(user.name);
    }

    // Send welcome mail (non-blocking optional)
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

export const getRecommendedBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 6;

    const currentBlog = await Blog.findById(id).select("type tags status");
    if (!currentBlog)
      return res.status(404).json(new ApiError(404, "Blog not found"));

    const matchQuery = {
      _id: { $ne: currentBlog._id },
      type: currentBlog.type,
      status: "Published",
    };

    if (currentBlog.tags.length > 0) {
      matchQuery.tags = { $in: currentBlog.tags };
    }

    const totalSameType = await Blog.countDocuments({
      type: currentBlog.type,
      status: "Published",
    });

    if (totalSameType < 5)
      return res
        .status(200)
        .json(new ApiResponse(200, [], "Not enough blogs for recommendations"));

    const allRecommendations = await Blog.find(matchQuery)
      .sort({ createdAt: -1 })
      .select("title thumbnail datePosted _id");

    const total = allRecommendations.length;
    const startIdx = ((page - 1) * limit) % total;

    const recommendations = [];
    for (let i = 0; i < limit; i++) {
      recommendations.push(allRecommendations[(startIdx + i) % total]);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, recommendations, "Fetched recommended blogs"));
  } catch (error) {
    console.error("Error fetching recommended blogs:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};
