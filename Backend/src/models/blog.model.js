import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: [(arr) => arr.length <= 5, "Maximum 5 tags allowed"],
    },
    type: {
      type: String,
      enum: ["Diary", "Article"],
      default: "Not Set",
    },
    uid: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timeToRead: {
      type: Number,
      default: 1,
    },
    likes: {
      type: Number,
      default: 0,
    },
    datePosted: {
      type: Date,
      default: Date.now,
    },
    thumbnail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.pre("save", function (next) {
  const plainText = this.content.replace(/<[^>]+>/g, ""); // strip HTML
  const wordCount = plainText.trim().split(/\s+/).length;
  this.timeToRead = Math.max(1, Math.ceil(wordCount / 200)); // 200 wpm
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
