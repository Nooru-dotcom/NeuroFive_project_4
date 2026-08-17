import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const COOKIE_NAME = "token";
const COOKIE_OPTS = {
  httpOnly: true, // JS on the frontend can never read this cookie (mitigates XSS token theft)
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax", // basic CSRF mitigation
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function validatePassword(pw) {
  // At least 8 chars, one letter, one number
  if (typeof pw !== "string" || pw.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are all required." });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return res.status(400).json({ error: pwError });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const info = db
    .prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)")
    .run(email.toLowerCase(), name.trim(), passwordHash);

  const user = { id: info.lastInsertRowid, email: email.toLowerCase(), name: name.trim() };
  const token = signToken(user);

  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
  res.status(201).json({ user });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  // Same error for "no such user" and "wrong password" — don't leak which one it was.
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const user = { id: row.id, email: row.email, name: row.name };
  const token = signToken(user);

  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
  res.json({ user });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTS, maxAge: undefined });
  res.json({ ok: true });
});

// GET /api/auth/me  (used by the frontend to check session on load)
router.get("/me", requireAuth, (req, res) => {
  const row = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(req.user.userId);
  if (!row) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: row });
});

export default router;
