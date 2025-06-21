// comment.controller.js
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Blog from "../models/blog.model.js";
import { publishNotification } from "../redis/redisPublisher.js";

export const createComment = async (req, res, next) => {
  const { blogId, content, parentCommentId = null } = req.body;
  const userId = req.user._id;

  if (!content) return next(new ApiError(400, "Comment cannot be empty"));

  try {
    const newComment = new Comment({
      blogId,
      userId,
      content,
      parentCommentId,
    });
    await newComment.save();
    const populatedComment = await newComment.populate(
      "userId",
      "name photoURL"
    );

    if (!req.user.isAdmin) {
      const [user, blog] = await Promise.all([
        User.findById(userId).select("name photoURL"),
        Blog.findById(blogId).select("title"),
      ]);

      await publishNotification("new_notification", {
        type: "comment",
        message: `${user.name} commented on "${blog.title}"`,
        blogId: blog._id,
        user: user._id,
        userSnapshot: {
          name: user.name,
          photoURL: user.photoURL,
        },
        blogTitleSnapshot: blog.title,
      });
    }
    res
      .status(201)
      .json(new ApiResponse(201, populatedComment, "Comment created"));
  } catch (err) {
    next(new ApiError(500, "Failed to add comment"));
  }
};

export const getCommentsByBlogId = async (req, res) => {
  const blogId = req.params.blogId;

  const comments = await Comment.find({
    blogId,
    parentCommentId: null,
  })
    .populate("userId", "name photoURL")
    .sort({ createdAt: -1 });

  const replies = await Comment.find({
    blogId,
    parentCommentId: { $ne: null },
  }).populate("userId", "name photoURL");

  const replyMap = {};
  replies.forEach((reply) => {
    const parentId = reply.parentCommentId.toString();
    if (!replyMap[parentId]) replyMap[parentId] = [];
    replyMap[parentId].push(reply);
  });

  const commentsWithReplies = comments.map((comment) => ({
    ...comment.toObject(),
    replies: replyMap[comment._id.toString()] || [],
    replyCount: replyMap[comment._id.toString()]?.length || 0, // 👈 new field
  }));

  res
    .status(200)
    .json(new ApiResponse(200, commentsWithReplies, "Comments fetched"));
};

// ✅ Edit Comment
export const editComment = async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return next(new ApiError(404, "Comment not found"));
    if (!comment.userId.equals(req.user._id))
      return next(new ApiError(403, "Unauthorized"));

    comment.content = content;
    await comment.save();

    res.status(200).json(new ApiResponse(200, comment, "Comment updated"));
  } catch (err) {
    next(new ApiError(500, "Failed to update comment"));
  }
};
export const deleteComment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return next(new ApiError(404, "Comment not found"));

    // Allow deletion if owner or admin
    if (!comment.userId.equals(req.user._id) && !req.user.isAdmin)
      return next(new ApiError(403, "Unauthorized"));

    // Delete comment and its replies
    await Comment.deleteMany({
      $or: [{ _id: id }, { parentCommentId: id }],
    });

    res.status(200).json(new ApiResponse(200, null, "Comment deleted"));
  } catch (err) {
    next(new ApiError(500, "Failed to delete comment"));
  }
};

// Toggle like/unlike
export const toggleLike = async (req, res) => {
  const userId = req.user._id;
  const commentId = req.params.id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();
    res.status(200).json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likes: comment.likes,
    });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const replyToComment = async (req, res) => {
  const { content, parentCommentId, blogId } = req.body;

  if (!content || !parentCommentId || !blogId) {
    throw new ApiError(400, "Missing required fields");
  }

  const parent = await Comment.findById(parentCommentId).populate(
    "userId",
    "isAdmin"
  );
  if (!parent) {
    throw new ApiError(404, "Parent comment not found");
  }

  const reply = await Comment.create({
    content,
    parentCommentId,
    blogId,
    userId: req.user._id,
  });

  const populatedReply = await reply.populate("userId", "name photoURL");

  if (parent.userId.isAdmin){
    const [user, blog] = await Promise.all([
      User.findById(req.user._id).select("name photoURL"),
      Blog.findById(blogId).select("title"),
    ]);

    await publishNotification("new_notification", {
      type: "reply",
      message: `${user.name} replied to your comment on "${blog.title}"`,
      blogId: blog._id,
      user: user._id,
      userSnapshot: {
        name: user.name,
        photoURL: user.photoURL,
      },
      blogTitleSnapshot: blog.title,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, populatedReply, "Reply posted successfully"));
};
