import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.route.js";
import blogRoutes from "./src/routes/blog.route.js";
import planRoutes from "./src/routes/plan.route.js";
import commentRoutes from "./src/routes/comment.route.js";
import notificationRoutes from "./src/routes/notification.route.js";
import "./src/redis/redisSubscriber.js";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the Anjali Blogs API !!");
});

app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/status", (req, res) => {
  res.status(200).json({ success: true, message: "Server is alive!" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err);
  });
