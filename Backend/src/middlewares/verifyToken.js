// src/middleware/verifyToken.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json(new ApiError(401, "Authentication token missing"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json(new ApiError(401, "Invalid or expired token"));
  }
};

export default verifyToken;
