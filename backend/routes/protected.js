import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Any route behind requireAuth returns 401 to unauthenticated callers.
// This stands in for whatever "protected page" data your app needs.
router.get("/dashboard-data", requireAuth, (req, res) => {
  res.json({
    message: `Welcome back, ${req.user.name}. This data only loads for logged-in users.`,
    secretNumber: Math.floor(Math.random() * 1000),
  });
});

export default router;
