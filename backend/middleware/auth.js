import jwt from "jsonwebtoken";

// Reads the JWT from the httpOnly cookie, verifies it, and attaches
// the decoded payload (userId, email) to req.user. If missing/invalid,
// responds 401 so protected routes never run for unauthenticated callers.
export function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}
