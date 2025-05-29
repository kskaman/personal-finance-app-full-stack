import dotenv from "dotenv";
dotenv.config();
import { connectRedis } from "./redisClient.js";
import app from "./app.js";

await connectRedis();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
