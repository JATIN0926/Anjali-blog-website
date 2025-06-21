import redisClient from "./redisClient.js";

export const publishNotification = async (event, data) => {
  try {
    await redisClient.publish(event, JSON.stringify(data));
  } catch (err) {
    console.error("Redis publish error:", err);
  }
};
