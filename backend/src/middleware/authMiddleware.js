import jwt from "jsonwebtoken";
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization?.split(" ");
  if (!authHeader || authHeader[0] !== "Bearer") {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const payload = jwt.verify(authHeader[1], process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
