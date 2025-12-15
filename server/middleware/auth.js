import jwt from "jsonwebtoken";
import TokenBlacklist from "../services/tokenBlacklist.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ error: "Invalid Authorization format" });

  const token = parts[1];
  if (TokenBlacklist.has(token)) return res.status(401).json({ error: "Token revoked" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    req.username = payload.username;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
