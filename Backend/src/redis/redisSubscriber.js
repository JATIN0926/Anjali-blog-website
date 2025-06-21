import redisClient from "./redisClient.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Blog from "../models/blog.model.js";

const subscriber = redisClient.duplicate();
await subscriber.connect();

await subscriber.subscribe("new_notification", async (message) => {
  const data = JSON.parse(message);
  try {
    const user = await User.findById(data.user).select("name photoURL");
    const blog = data.blogId ? await Blog.findById(data.blogId).select("title") : null;

    await Notification.create({
      type: data.type,
      message: data.message,
      user: user._id,
      blogId: blog?._id || null,
      userSnapshot: {
        name: user.name,
        photoURL: user.photoURL,
      },
      blogTitleSnapshot: blog?.title || null,
    });

    console.log("✅ Notification saved:", data);
  } catch (err) {
    console.error("❌ Error saving notification:", err);
  }
});
