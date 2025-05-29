import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: { connectTimeout: 10000 },
});

redisClient.on("error", (err) => console.error("Redis error", err));
redisClient.on("reconnecting", (d) =>
  console.log(
    `Redis reconnect in ${d?.delay ?? "unknown"} ms, attempt ${
      d?.attempt ?? "unknown"
    }`
  )
);

let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log("✅ Redis connected");
    } catch (e) {
      console.error("❌ Redis connection failed:", e);
      throw e;
    }
  }
};

export default redisClient;
