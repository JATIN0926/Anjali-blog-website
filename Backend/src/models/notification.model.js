import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: String,
    message: String,
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userSnapshot: {
      name: String,
      photoURL: String,
    },
    blogTitleSnapshot: String,
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
