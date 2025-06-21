import Notification from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const getLatestNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate("user", "name photoURL");

    if (!notifications || notifications.length === 0) {
      throw new ApiError(404, "No notifications found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, notifications, "Notifications fetched"));
  } catch (err) {
    return res
      .status(500)
      .json(new ApiError(500, "Failed to fetch notifications"));
  }
};
