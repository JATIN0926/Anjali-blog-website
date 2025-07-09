import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();
const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("ready", () => {
  console.log("🚀 Redis client connected & ready!");
});

await redisClient.connect();

export default redisClient;
