import redis from "../redisClient.js";

export async function authenticate(req, res, next) {
  const sid = req.cookies.sid;
  if (!sid) return res.status(401).json({ error: "Not authenticated" });

  const userId = await redis.get(`SESSION:${sid}`);
  if (!userId) return res.status(401).json({ error: "Session expired" });

  // sliding-TTL: renew 4h from now
  await redis.expire(`SESSION:${sid}`, 60 * 60 * 4);

  req.userId = userId;

  next();
}
